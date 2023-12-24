import f32vec4x from "./vec4x";

//
function invf(i: i32, j: i32, m: f32mat4s): f32 {
    const o: i32 = 2 + (j - i);
    (i += 4 + o), (j += 4 - o);
    const e = (a: i32, b: i32): f32 => f32x4.extract_lane(m.m[(j + b) % 4], (i + a) % 4);
    const inv = +e(+1, -1) * e(+0, +0) * e(-1, +1) + e(+1, +1) * e(+0, -1) * e(-1, +0) + e(-1, -1) * e(+1, +0) * e(+0, +1) - e(-1, -1) * e(+0, +0) * e(+1, +1) - e(-1, +1) * e(+0, -1) * e(+1, +0) - e(+1, -1) * e(-1, +0) * e(+0, +1);
    return o % 2 ? inv : -inv;
}

//
export default class f32mat4s {
    constructor(public m: v128[]) {}

    transpose(): f32vec4x {
        const tmp0 = i8x16.shuffle(this.m[0], this.m[1], 0x00, 0x01, 0x02, 0x03, 0x10, 0x11, 0x12, 0x13, 0x04, 0x05, 0x06, 0x07, 0x14, 0x15, 0x16, 0x17);
        const tmp2 = i8x16.shuffle(this.m[0], this.m[1], 0x08, 0x09, 0x0a, 0x0b, 0x18, 0x19, 0x1a, 0x1b, 0x0c, 0x0d, 0x0e, 0x0f, 0x1c, 0x1d, 0x1e, 0x1f);
        const tmp1 = i8x16.shuffle(this.m[2], this.m[3], 0x00, 0x01, 0x02, 0x03, 0x10, 0x11, 0x12, 0x13, 0x04, 0x05, 0x06, 0x07, 0x14, 0x15, 0x16, 0x17);
        const tmp3 = i8x16.shuffle(this.m[2], this.m[3], 0x08, 0x09, 0x0a, 0x0b, 0x18, 0x19, 0x1a, 0x1b, 0x0c, 0x0d, 0x0e, 0x0f, 0x1c, 0x1d, 0x1e, 0x1f);
        return new f32vec4x(i8x16.shuffle(tmp0, tmp1, 0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x10, 0x11, 0x12, 0x13, 0x14, 0x15, 0x16, 0x17), i8x16.shuffle(tmp0, tmp1, 0x08, 0x09, 0x0a, 0x0b, 0x0c, 0x0d, 0x0e, 0x0f, 0x18, 0x19, 0x1a, 0x1b, 0x1c, 0x1d, 0x1e, 0x1f), i8x16.shuffle(tmp2, tmp3, 0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x10, 0x11, 0x12, 0x13, 0x14, 0x15, 0x16, 0x17), i8x16.shuffle(tmp2, tmp3, 0x08, 0x09, 0x0a, 0x0b, 0x0c, 0x0d, 0x0e, 0x0f, 0x18, 0x19, 0x1a, 0x1b, 0x1c, 0x1d, 0x1e, 0x1f));
    }

    mul(b: f32vec4x): f32vec4x {
        const tps: f32vec4x = b; //.transpose();
        return tps.madd(new f32vec4x(this.m[0], this.m[0], this.m[0], this.m[0]), tps.madd(new f32vec4x(this.m[1], this.m[1], this.m[1], this.m[1]), tps.madd(new f32vec4x(this.m[2], this.m[2], this.m[2], this.m[2]), tps.mul(new f32vec4x(this.m[3], this.m[3], this.m[3], this.m[3])))));
    }

    mud(b: f32vec4x): v128 {
        const tps: f32vec4x = b; //.transpose();
        return f32x4.relaxed_madd(tps.x, this.m[0], f32x4.relaxed_madd(tps.y, this.m[1], f32x4.relaxed_madd(tps.z, this.m[2], f32x4.mul(tps.w, this.m[3]))));
    }

    invert(): f32mat4s {
        const inv: f32mat4s = new f32mat4s([f32x4(1.0, 0.0, 0.0, 0.0), f32x4(0.0, 1.0, 0.0, 0.0), f32x4(0.0, 0.0, 1.0, 0.0), f32x4(1.0, 0.0, 0.0, 1.0)]);
        for (let i: i32 = 0; i < 4; i++) for (let j: i32 = 0; j < 4; j++) inv.m[j] = f32x4.replace_lane(inv.m[j], i, invf(i, j, this));
        let D: f32 = 0;
        for (let k: i32 = 0; k < 4; k++) {
            D += f32x4.extract_lane(this.m[0], k) * f32x4.extract_lane(inv.m[k], 0);
        }
        return new f32mat4s([f32x4.mul(inv.m[0], f32x4.splat(1.0 / D)), f32x4.mul(inv.m[1], f32x4.splat(1.0 / D)), f32x4.mul(inv.m[2], f32x4.splat(1.0 / D)), f32x4.mul(inv.m[3], f32x4.splat(1.0 / D))]);
    }
}
