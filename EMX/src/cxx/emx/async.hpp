#pragma once

//
#include "./core.hpp"
#include "./promisepp.hpp"

//
namespace emx {

    //
    std::string what(const std::exception_ptr &eptr = std::current_exception())
    {
        if (!eptr) { throw std::bad_exception(); }

        try { std::rethrow_exception(eptr); }
        catch (const std::exception &e) { return e.what()   ; }
        catch (const std::string    &e) { return e          ; }
        catch (const char           *e) { return e          ; }
        catch (...)                     { return "who knows"; }
    }

    //
    template <typename T>
    class async {
        public: 
            struct promise_type;

        protected: 
            using coro_t = std::coroutine_handle<promise_type>;
            std::shared_ptr<coro_t> handle = {};

            //
            struct awaiter {
                struct promise_type* p;
                bool await_ready() const noexcept { return false; }
                T await_resume() const noexcept { return p->data.value(); }

                //
                static void unhandled_exception() noexcept { 
                    std::cerr << what() << std::endl;
                }

                // 
                std::coroutine_handle<> await_suspend(std::coroutine_handle<promise_type> h) {
                    auto precursor = h.promise().precursor;
                    if (precursor) { return precursor; }
                    return std::noop_coroutine();
                }
            };

        public: 
            // The return type of a coroutine must contain a nested struct or type alias called `promise_type`
            struct promise_type {
                std::optional<T> data = {};
                std::coroutine_handle<> precursor;
                em_promisepp_t<T> em_promise = {};

                //
                operator em_promise_t() const noexcept { return em_promise; };
                operator em_promisepp_t<T>() const noexcept { return em_promise; };
                operator bool() const noexcept { return (data != std::nullopt); };
                operator T() const noexcept { return data.value(); };

                //
                auto resolve(T const& v) noexcept {
                    return em_promise.resolve(v);
                };

                // Invoked when we first enter a coroutine. We initialize the precursor handle
                // with a resume point from where the async is ultimately suspended
                async get_return_object() noexcept {
                    return async(coro_t::from_promise(*this), em_promise);
                }

                // When the caller enters the coroutine, we have the option to suspend immediately.
                // Let's choose not to do that here
                static auto initial_suspend() noexcept { return std::suspend_never{}; }

                //
                auto final_suspend() noexcept { return awaiter{this}; }

                // When the coroutine co_returns a value, this method is used to publish the result
                awaiter return_value(T const& value) noexcept {
                    if (em_promise) {
                        em_promise.resolve((data = value).value());
                    } else {
                        //std::cerr << "JS promise is not exist..." << std::endl;
                        data = value;
                    }
                    return awaiter{this};
                };

                //
                void unhandled_exception() noexcept {
                    const auto msg = what();
                    std::cerr << msg << std::endl;
                    if (em_promise) {
                        em_promise.reject(msg);
                    }
                }
            };

        protected: 
            //
            auto& make_promise(em_promisepp_t<T> $em_promise = {}) {
                auto& p = handle->promise();
                p.em_promise = $em_promise;
                return p;
            }

            //
            auto& make_promise(em_promise_t $em_promise) {
                auto& p = handle->promise();
                p.em_promise = $em_promise ? $em_promise : emscripten_promise_create();
                return p;
            }

        //
        public: 
            // constructors
            async(const async &) = delete;
            async(async && t) : handle(t.handle) {}

            //
            async(em_promise_t promise = nullptr) : handle(std::make_shared<coro_t>(coro_t{})) { this->make_promise(promise); }
            async(coro_t&& h, em_promise_t promise = nullptr) : handle(std::make_shared<coro_t>(std::move(h))) { this->make_promise(promise); }

            //
            async(em_promisepp_t<T> promise = {}) : handle(std::make_shared<coro_t>(coro_t{})) { this->make_promise(promise); }
            async(coro_t&& h, em_promisepp_t<T> promise = {}) : handle(std::make_shared<coro_t>(std::move(h))) { this->make_promise(promise); }

            // assignment operators
            async& operator =(async &&t) { handle = t.handle; return *this; }
            async& operator =(coro_t&& h) = delete;

            //
            auto resolve(T const& v) noexcept { return handle->promise().resolve(v); };
            em_promisepp_t<T> get_promise()  const noexcept { return handle->promise(); };
            T get_data() const noexcept { return handle->promise(); };

            //
            operator em_promise_t() const noexcept { return handle->promise(); };
            operator em_promisepp_t<T>() const noexcept { return handle->promise(); };
            operator bool() const noexcept { return handle->promise(); };
            operator T() const noexcept { return handle->promise(); };

            //
            //bool done() const noexcept { return this->handle->done(); };
            //auto resume() noexcept { return this->handle->resume(); };

            //
            void await_suspend(std::coroutine_handle<> coroutine) const noexcept {
                auto& $p = this->handle->promise();
                $p.precursor = coroutine;
                $p.em_promise.template then<T>(
                    [&$p](T const& v) -> T {
                        $p.data = v;
                        $p.precursor.resume();
                        return v;
                    }, 
                    [&$p](T const& v) -> T { return v; }
                );
            }

            //
            bool await_ready() const noexcept { return handle->done(); }
            T await_resume() const noexcept { return handle->promise().data.value(); }
    };

};
