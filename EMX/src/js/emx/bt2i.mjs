import EMX from "./handle.mjs"
import * as BT2 from "../../../deps/BTyped2/src/js/index.mjs"

//
EMX.fromTypedPtr = ($mod, $ptr, $tname) => {
    return new (BT2.StructWrap($tname))($mod.HEAP8.buffer, Number($ptr))["*"];
};

//
EMX.toTypedPtr = ($mod, $val, $tname) => {
    const $com = BT2.StructWrap($tname);
    const $ptr = $mod._calloc(1n, BigInt($com.$byteLength));
    new $com($mod.HEAP8.buffer, Number($ptr))["*"] = $val;
    return $ptr;
};

//
export default EMX;
