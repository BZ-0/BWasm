//
#include <emx/async.hpp>
#include <emx/interface.hpp>

//
extern "C" {
    using prom_t = emx::em_promisepp_t<long>;

    // 
    em_promise_t testPromise(em_promise_t promise) {
        return [](em_promise_t promise) -> emx::async<long> {
            std::cout << co_await emx::async<long>(promise) << std::endl;
            std::cout << "Async Execution" << std::endl;
            co_return 5ull;
        }(promise);
    }
}
