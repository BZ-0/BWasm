#ifndef JXL2PNG_H
#define JXL2PNG_H

#include <stddef.h>
#include <stdint.h>
#include <emscripten/emscripten.h>
//#include <half/half.hpp>

//
struct _icc_profile_ {
    uint8_t* data = nullptr;
    size_t size = 0ul;
};

//
EMSCRIPTEN_KEEPALIVE

//
extern "C" {
    //
    struct _file_data_ {
        uint8_t* data;
        size_t size;
    };

    //
    struct _short_data_ {
        uint16_t* data;
        size_t width, height, meta;
    };

    //
    bool RecodeJXLtoPNG(_file_data_ const* input, _file_data_* output);
}

#endif
