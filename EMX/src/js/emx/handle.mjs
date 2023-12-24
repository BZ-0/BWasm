//
const toPromise = (_mod, _ptr)=>{
    return new Promise((resolve, reject)=>{
        const $rv = _mod.addFunction((r)=>{resolve(r); return r;}, "jj");
        const $rj = _mod.addFunction((r)=>{reject(r); return r;}, "jj");
        _mod._emx_promise_then(_ptr, BigInt($rv), BigInt($rj));
    });
}

//
const fromPromise = (_mod, _prom)=>{
    const _ptr = _mod._emx_promise_create();
    const _res = (a) => (_mod._emx_promise_resolve(_ptr, a));
    const _rej = (e) => (_mod._emx_promise_reject(_ptr, e));
    _prom.then(_res).catch(_rej);
    return _ptr;
}

//
const toU64ptr = ($mod, $val, $le = true) => { const $ptr = $mod._calloc(1n, 8n); new DataView($mod.HEAP8.buffer, Number($ptr), 8).setBigUint64(0, $val, $le); return $ptr; }
const toI64ptr = ($mod, $val, $le = true) => { const $ptr = $mod._calloc(1n, 8n); new DataView($mod.HEAP8.buffer, Number($ptr), 8).setBigInt64(0, $val, $le); return $ptr; }
const toF64ptr = ($mod, $val, $le = true) => { const $ptr = $mod._calloc(1n, 8n); new DataView($mod.HEAP8.buffer, Number($ptr), 8).setFloat64(0, $val, $le); return $ptr; }
const toU32ptr = ($mod, $val, $le = true) => { const $ptr = $mod._calloc(1n, 4n); new DataView($mod.HEAP8.buffer, Number($ptr), 4).setUint32(0, $val, $le); return $ptr; }
const toI32ptr = ($mod, $val, $le = true) => { const $ptr = $mod._calloc(1n, 4n); new DataView($mod.HEAP8.buffer, Number($ptr), 4).setInt32(0, $val, $le); return $ptr; }
const toF32ptr = ($mod, $val, $le = true) => { const $ptr = $mod._calloc(1n, 4n); new DataView($mod.HEAP8.buffer, Number($ptr), 4).setFloat32(0, $val, $le); return $ptr; }

//
const fromU64ptr = ($mod, $ptr, $le = true) => { return new DataView($mod.HEAP8.buffer, Number($ptr), 8).getBigUint64(0, $le); }
const fromI64ptr = ($mod, $ptr, $le = true) => { return new DataView($mod.HEAP8.buffer, Number($ptr), 8).getBigInt64(0, $le); }
const fromF64ptr = ($mod, $ptr, $le = true) => { return new DataView($mod.HEAP8.buffer, Number($ptr), 8).getFloat64(0, $le); }
const fromU32ptr = ($mod, $ptr, $le = true) => { return new DataView($mod.HEAP8.buffer, Number($ptr), 4).getUint32(0, $le); }
const fromI32ptr = ($mod, $ptr, $le = true) => { return new DataView($mod.HEAP8.buffer, Number($ptr), 4).getInt32(0, $le); }
const fromF32ptr = ($mod, $ptr, $le = true) => { return new DataView($mod.HEAP8.buffer, Number($ptr), 4).getFloat32(0, $le); }

//
const EMX = {
    //
    fromU64ptr,
    fromI64ptr,
    fromF64ptr,
    toU64ptr,
    toI64ptr,
    toF64ptr,

    //
    fromU32ptr,
    fromI32ptr,
    fromF32ptr,
    toU32ptr,
    toI32ptr,
    toF32ptr,

    //
    toPromise,
    fromPromise
};

//
export default EMX;
