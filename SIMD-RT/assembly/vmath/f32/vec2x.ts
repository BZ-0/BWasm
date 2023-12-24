export default class f32vec2x {
    constructor(public x: v128, public y: v128) {}

    neg(): f32vec2x {
        return new f32vec2x(f32x4.neg(this.x), f32x4.neg(this.y));
    }

    add(b: f32vec2x): f32vec2x {
        return new f32vec2x(f32x4.add(this.x, b.x), f32x4.add(this.y, b.y));
    }

    madd(b: f32vec2x, c: f32vec2x): f32vec2x {
        return new f32vec2x(f32x4.relaxed_madd(this.x, b.x, c.x), f32x4.relaxed_madd(this.y, b.y, c.y));
    }

    nmadd(b: f32vec2x, c: f32vec2x): f32vec2x {
        return new f32vec2x(f32x4.relaxed_nmadd(this.x, b.x, c.x), f32x4.relaxed_nmadd(this.y, b.y, c.y));
    }

    sub(b: f32vec2x): f32vec2x {
        return new f32vec2x(f32x4.sub(this.x, b.x), f32x4.sub(this.y, b.y));
    }

    div_s(b: v128): f32vec2x {
        return new f32vec2x(f32x4.div(this.x, b), f32x4.div(this.y, b));
    }

    div(b: f32vec2x): f32vec2x {
        return new f32vec2x(f32x4.div(this.x, b.x), f32x4.div(this.y, b.y));
    }

    mul(b: f32vec2x): f32vec2x {
        return new f32vec2x(f32x4.mul(this.x, b.x), f32x4.mul(this.y, b.y));
    }

    mul_s(b: v128): f32vec2x {
        return new f32vec2x(f32x4.mul(this.x, b), f32x4.mul(this.y, b));
    }

    dot(b: f32vec2x): v128 {
        return f32x4.relaxed_madd(this.x, b.x, f32x4.mul(this.y, b.y));
    }

    length(): v128 {
        return f32x4.sqrt(f32x4.relaxed_madd(this.x, this.x, f32x4.mul(this.y, this.y)));
    }

    normalize(): f32vec2x {
        return new f32vec2x(this.x, this.y).div_s(this.length());
    }

    laneselect(b: f32vec2x, c: v128): f32vec2x {
        return new f32vec2x(i32x4.relaxed_laneselect(this.x, b.x, c), i32x4.relaxed_laneselect(this.y, b.y, c));
    }

    laneselect_n(b: f32vec2x, c: v128): f32vec2x {
        return new f32vec2x(i32x4.relaxed_laneselect(b.x, this.x, c), i32x4.relaxed_laneselect(b.y, this.y, c));
    }

    bitselect(b: f32vec2x, c: v128): f32vec2x {
        return new f32vec2x(v128.bitselect(this.x, b.x, c), v128.bitselect(this.y, b.y, c));
    }
}
