#pragma once

//
#include "./core.hpp"

//
namespace emx {

    //
    template<class T>
    class em_promisepp_t {
        //
        protected: em_promise_t em_promise = nullptr;

        //
        public: em_promisepp_t(em_promisepp_t const& pm) : em_promise(pm.em_promise) {}
        public: em_promisepp_t(em_promise_t em_promise) : em_promise(em_promise) {}
        public: em_promisepp_t() : em_promise(emscripten_promise_create()) {}
        //public: ~em_promisepp_t() { if (this->em_promise) { emscripten_promise_destroy(this->em_promise); } this->em_promise = nullptr; };

        //
        public: em_promisepp_t<T>& operator=(em_promisepp_t<T> const& pm) {
            em_promise = pm.em_promise;
            return *this;
        }

        //
        public: em_promisepp_t<T>& operator=(em_promise_t pm) {
            em_promise = pm;
            return *this;
        }

        //
        public: operator bool() const { return !!em_promise; }
        public: operator em_promise_t() const { return em_promise; }

        //
        public: em_promisepp_t<T>& reject(auto const& value) {
            emscripten_promise_resolve(em_promise, EM_PROMISE_REJECT, (void*)&value);
            return *this;
        }

        //
        public: em_promisepp_t<T>& resolve(auto const& value) {
            emscripten_promise_resolve(em_promise, EM_PROMISE_FULFILL, (void*)&value);
            return *this;
        }

        //
        public: template<class R = T> 
        em_promisepp_t<R> then(
            std::function<R(T const&)> const& fulfill = {},
            std::function<R(T const&)> const& rejected = {}
        ) {
            using fn_t = std::function<R(T const&)>;
            using fj_t = std::function<R(T const&)>;
            using pr_t = std::pair<fn_t, fj_t>;
            pr_t* ffx = new pr_t{fulfill, rejected};
            return em_promisepp_t<R>(emscripten_promise_then(em_promise, 
                [](void**result, void*data, void*value) {
                    const auto ffx = reinterpret_cast<pr_t*>(data);
                    *result = new R{ffx->first(*reinterpret_cast<T*>(value))};
                    return EM_PROMISE_FULFILL;
                }, 
                [](void**result, void*data, void*value) {
                    const auto ffx = reinterpret_cast<pr_t*>(data);
                    *result = new R{ffx->second(*reinterpret_cast<T*>(value))};
                    return EM_PROMISE_REJECT;
                }, 
                ffx
            ));
        }
    };
}
