//
#include "./jxl2png.hpp"

//
#include <iostream>
#include <inttypes.h>
#include <jxl/decode.h>
#include <jxl/decode_cxx.h>
#include <limits.h>
#include <stdint.h>
#include <stdio.h>
#include <string.h>
#include <memory.h>
#include <stdlib.h>

//
#include <emscripten/emscripten.h>
#include <lodepng/lodepng.h>

//
EMSCRIPTEN_KEEPALIVE

//
extern "C" {
    namespace {
        bool RecodeJXLtoPNG(_file_data_ const* input, _file_data_* output) {
            auto dec = JxlDecoderMake(nullptr);
            if (JXL_DEC_SUCCESS != JxlDecoderSubscribeEvents(dec.get(), JXL_DEC_BASIC_INFO | JXL_DEC_COLOR_ENCODING | JXL_DEC_FULL_IMAGE)) {
                std::cerr << "JxlDecoderSubscribeEvents failed\n" << std::endl;
                return false;
            }

            //
            JxlBasicInfo info;
            JxlPixelFormat format = {4, JXL_TYPE_UINT16, JXL_BIG_ENDIAN, 0};

            //
            JxlDecoderSetInput(dec.get(), input->data, input->size);
            JxlDecoderCloseInput(dec.get());

            //
            uint32_t width = 0u, height = 0u;
            uint16_t* data = nullptr;

            //
            _icc_profile_ icc_profile = {};

            for (;;) {
                JxlDecoderStatus status = JxlDecoderProcessInput(dec.get());

                if (status == JXL_DEC_ERROR) {
                    std::cerr << "Decoder error\n" << std::endl;
                    return false;
                } else if (status == JXL_DEC_NEED_MORE_INPUT) {
                    std::cerr << "Error, already provided all input\n" << std::endl;
                    return false;
                } else if (status == JXL_DEC_BASIC_INFO) {
                    if (JXL_DEC_SUCCESS != JxlDecoderGetBasicInfo(dec.get(), &info)) {
                        std::cerr << "JxlDecoderGetBasicInfo failed\n" << std::endl;
                        return false;
                    }
                    width = info.xsize, height = info.ysize;
                } else if (status == JXL_DEC_COLOR_ENCODING) {
                    // Get the ICC color profile of the pixel data
                    if (JXL_DEC_SUCCESS != JxlDecoderGetICCProfileSize(dec.get(), JXL_COLOR_PROFILE_TARGET_DATA, &icc_profile.size)) {
                        std::cerr << "JxlDecoderGetICCProfileSize failed\n" << std::endl;
                        return false;
                    }

                    icc_profile.data = (uint8_t*)calloc(1, icc_profile.size);
                    if (JXL_DEC_SUCCESS != JxlDecoderGetColorAsICCProfile( dec.get(), JXL_COLOR_PROFILE_TARGET_DATA, icc_profile.data, icc_profile.size)) {
                        std::cerr << "JxlDecoderGetColorAsICCProfile failed\n" << std::endl;
                        return false;
                    }
                } else if (status == JXL_DEC_NEED_IMAGE_OUT_BUFFER) {
                    size_t buffer_size = 0;
                    if (JXL_DEC_SUCCESS !=
                        JxlDecoderImageOutBufferSize(dec.get(), &format, &buffer_size)) {
                        std::cerr << "JxlDecoderImageOutBufferSize failed\n" << std::endl;
                        return false;
                    }
                    if (buffer_size != (width * height * 4 * sizeof(uint16_t))) {
                        std::cerr << "Invalid buffer size..." << std::endl;
                        return false;
                    }

                    data = (uint16_t*)calloc(1, width * height * 4 * sizeof(uint16_t));
                    if (JXL_DEC_SUCCESS != JxlDecoderSetImageOutBuffer(dec.get(), &format, (void*)data, width * height * 4 * sizeof(uint16_t))) {
                        std::cerr << "JxlDecoderSetImageOutBuffer failed\n" << std::endl;
                        return false;
                    }
                } else if (status == JXL_DEC_FULL_IMAGE) {
                    // Nothing to do. Do not yet return. If the image is an animation, more
                    // full frames may be decoded. This example only keeps the last one.
                } else if (status == JXL_DEC_SUCCESS) {
                    // All decoding successfully finished.
                    // It's not required to call JxlDecoderReleaseInput(dec.get()) here since
                    // the decoder will be destroyed.
                    
                    {   //
                        unsigned error = 0u;
                        LodePNGState state;
                        lodepng_state_init(&state);
                        state.info_raw.colortype = LCT_RGBA;
                        state.info_raw.bitdepth = 16;
                        if (icc_profile.data && icc_profile.size) {
                            lodepng_set_icc(&state.info_png, "JXL ICC Profile", icc_profile.data, icc_profile.size);
                        }
                        state.info_png.color.colortype = LCT_RGBA;
                        state.info_png.color.bitdepth = 16;
                        lodepng_encode(&output->data, &output->size, (uint8_t*)data, width, height, &state);
                        error = state.error; free(data);

                        //
                        if (error != 0u) {
                            std::cerr << std::string(lodepng_error_text(error)) << std::endl;
                        }

                        //
                        lodepng_state_cleanup(&state);
                        return (error == 0u);
                    }

                } else {
                    std::cerr << "Unknown decoder status\n" << std::endl;
                    return false;
                }
            }

            
        }
    }
}
