import Test from "../cxx/test.js"
import EMX from "../../src/js/emx/bt2i.mjs";

//
const $test = await Test();
//const $promise = $mod._tryPromise();

let $js_resolve = null;
const $js_promise = new Promise(($r)=>{
    $js_resolve = $r;
});

// 
const $ptr_back = $test._testPromise(EMX.fromPromise($test, $js_promise));

//
$js_resolve(EMX.toTypedPtr($test, 256n, "uint64"));

// get result of
console.log(EMX.fromTypedPtr($test, await EMX.toPromise($test, $ptr_back), "uint64"));
