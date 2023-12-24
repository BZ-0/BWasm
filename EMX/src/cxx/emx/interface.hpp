#pragma once

//
#include "./core.hpp"

//
extern "C" {
    //
    //struct void_t{};
    using vr_t = uintptr_t;
    typedef vr_t(*fx_t)(vr_t);

    // 
    em_promise_t emx_promise_create() { return emscripten_promise_create();; }

    //
    bool emx_promise_reject(em_promise_t em, vr_t v) {
        emscripten_promise_resolve(em, EM_PROMISE_REJECT, (void*)v);
        return true;
    }

    //
    bool emx_promise_resolve(em_promise_t em, vr_t v) {
        emscripten_promise_resolve(em, EM_PROMISE_FULFILL, (void*)v);
        return true;
    }

    //
    em_promise_t emx_promise_then(em_promise_t em, fx_t fulfill, fx_t rejected) {
        using pr_t = std::pair<fx_t, fx_t>;
        pr_t* ffx = new pr_t{fulfill, rejected};

        //
        return emscripten_promise_then(em, 
            [](void**result, void*data, void*value) {
                const auto ffx = reinterpret_cast<pr_t*>(data);
                *result = (void*)ffx->first((vr_t)value);
                return EM_PROMISE_FULFILL;
            }, 
            [](void**result, void*data, void*value) {
                const auto ffx = reinterpret_cast<pr_t*>(data);
                *result = (void*)ffx->second((vr_t)value);
                return EM_PROMISE_REJECT;
            }, 
            ffx
        );
    }
}
