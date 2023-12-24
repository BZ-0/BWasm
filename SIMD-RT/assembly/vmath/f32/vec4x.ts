export default class f32vec4x {
    constructor(public x: v128, public y: v128, public z: v128, public w: v128) {}

    neg(): f32vec4x {
        return new f32vec4x(f32x4.neg(this.x), f32x4.neg(this.y), f32x4.neg(this.z), f32x4.neg(this.w));
    }

    div_s(b: v128): f32vec4x {
        return new f32vec4x(f32x4.div(this.x, b), f32x4.div(this.y, b), f32x4.div(this.z, b), f32x4.div(this.w, b));
    }

    div(b: f32vec4x): f32vec4x {
        return new f32vec4x(f32x4.div(this.x, b.x), f32x4.div(this.y, b.y), f32x4.div(this.z, b.z), f32x4.div(this.w, b.w));
    }

    mul_s(b: v128): f32vec4x {
        return new f32vec4x(f32x4.mul(this.x, b), f32x4.mul(this.y, b), f32x4.mul(this.z, b), f32x4.mul(this.w, b));
    }

    mul(b: f32vec4x): f32vec4x {
        return new f32vec4x(f32x4.mul(this.x, b.x), f32x4.mul(this.y, b.y), f32x4.mul(this.z, b.z), f32x4.mul(this.w, b.w));
    }

    sub(b: f32vec4x): f32vec4x {
        return new f32vec4x(f32x4.sub(this.x, b.x), f32x4.sub(this.y, b.y), f32x4.sub(this.z, b.z), f32x4.sub(this.w, b.w));
    }

    add(b: f32vec4x): f32vec4x {
        return new f32vec4x(f32x4.add(this.x, b.x), f32x4.add(this.y, b.y), f32x4.add(this.z, b.z), f32x4.add(this.w, b.w));
    }

    madd(b: f32vec4x, c: f32vec4x): f32vec4x {
        return new f32vec4x(f32x4.relaxed_madd(this.x, b.x, c.x), f32x4.relaxed_madd(this.y, b.y, c.y), f32x4.relaxed_madd(this.z, b.z, c.z), f32x4.relaxed_madd(this.w, b.w, c.w));
    }

    nmadd(b: f32vec4x, c: f32vec4x): f32vec4x {
        return new f32vec4x(f32x4.relaxed_nmadd(this.x, b.x, c.x), f32x4.relaxed_nmadd(this.y, b.y, c.y), f32x4.relaxed_nmadd(this.z, b.z, c.z), f32x4.relaxed_nmadd(this.w, b.w, c.w));
    }

    dot(b: f32vec4x): v128 {
        return f32x4.relaxed_madd(this.x, b.x, f32x4.relaxed_madd(this.y, b.y, f32x4.relaxed_madd(this.z, b.z, f32x4.mul(this.w, b.w))));
    }

    transpose(): f32vec4x {
        const tmp0 = i8x16.shuffle(this.x, this.y, 0x00, 0x01, 0x02, 0x03, 0x10, 0x11, 0x12, 0x13, 0x04, 0x05, 0x06, 0x07, 0x14, 0x15, 0x16, 0x17);
        const tmp2 = i8x16.shuffle(this.x, this.y, 0x08, 0x09, 0x0a, 0x0b, 0x18, 0x19, 0x1a, 0x1b, 0x0c, 0x0d, 0x0e, 0x0f, 0x1c, 0x1d, 0x1e, 0x1f);
        const tmp1 = i8x16.shuffle(this.z, this.w, 0x00, 0x01, 0x02, 0x03, 0x10, 0x11, 0x12, 0x13, 0x04, 0x05, 0x06, 0x07, 0x14, 0x15, 0x16, 0x17);
        const tmp3 = i8x16.shuffle(this.z, this.w, 0x08, 0x09, 0x0a, 0x0b, 0x18, 0x19, 0x1a, 0x1b, 0x0c, 0x0d, 0x0e, 0x0f, 0x1c, 0x1d, 0x1e, 0x1f);

        //
        return new f32vec4x(i8x16.shuffle(tmp0, tmp1, 0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x10, 0x11, 0x12, 0x13, 0x14, 0x15, 0x16, 0x17), i8x16.shuffle(tmp0, tmp1, 0x08, 0x09, 0x0a, 0x0b, 0x0c, 0x0d, 0x0e, 0x0f, 0x18, 0x19, 0x1a, 0x1b, 0x1c, 0x1d, 0x1e, 0x1f), i8x16.shuffle(tmp2, tmp3, 0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x10, 0x11, 0x12, 0x13, 0x14, 0x15, 0x16, 0x17), i8x16.shuffle(tmp2, tmp3, 0x08, 0x09, 0x0a, 0x0b, 0x0c, 0x0d, 0x0e, 0x0f, 0x18, 0x19, 0x1a, 0x1b, 0x1c, 0x1d, 0x1e, 0x1f));
    }

    length(): v128 {
        return f32x4.sqrt(f32x4.relaxed_madd(this.x, this.x, f32x4.relaxed_madd(this.y, this.y, f32x4.relaxed_madd(this.z, this.z, f32x4.mul(this.w, this.w)))));
    }

    normalize(): f32vec4x {
        return new f32vec4x(this.x, this.y, this.z, this.w).div_s(this.length());
    }

    laneselect(b: f32vec4x, c: v128): f32vec4x {
        return new f32vec4x(i32x4.relaxed_laneselect(this.x, b.x, c), i32x4.relaxed_laneselect(this.y, b.y, c), i32x4.relaxed_laneselect(this.z, b.z, c), i32x4.relaxed_laneselect(this.w, b.w, c));
    }

    laneselect_n(b: f32vec4x, c: v128): f32vec4x {
        return new f32vec4x(i32x4.relaxed_laneselect(b.x, this.x, c), i32x4.relaxed_laneselect(b.y, this.y, c), i32x4.relaxed_laneselect(b.z, this.z, c), i32x4.relaxed_laneselect(b.w, this.w, c));
    }

    bitselect(b: f32vec4x, c: v128): f32vec4x {
        return new f32vec4x(v128.bitselect(this.x, b.x, c), v128.bitselect(this.y, b.y, c), v128.bitselect(this.z, b.z, c), v128.bitselect(this.w, b.w, c));
    }
}
