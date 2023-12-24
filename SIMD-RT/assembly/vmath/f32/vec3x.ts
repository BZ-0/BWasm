export default class f32vec3x {
    constructor(public x: v128, public y: v128, public z: v128) {}

    neg(): f32vec3x {
        return new f32vec3x(f32x4.neg(this.x), f32x4.neg(this.y), f32x4.neg(this.z));
    }

    add(b: f32vec3x): f32vec3x {
        return new f32vec3x(f32x4.add(this.x, b.x), f32x4.add(this.y, b.y), f32x4.add(this.z, b.z));
    }

    madd(b: f32vec3x, c: f32vec3x): f32vec3x {
        return new f32vec3x(f32x4.relaxed_madd(this.x, b.x, c.x), f32x4.relaxed_madd(this.y, b.y, c.y), f32x4.relaxed_madd(this.z, b.z, c.z));
    }

    nmadd(b: f32vec3x, c: f32vec3x): f32vec3x {
        return new f32vec3x(f32x4.relaxed_nmadd(this.x, b.x, c.x), f32x4.relaxed_nmadd(this.y, b.y, c.y), f32x4.relaxed_nmadd(this.z, b.z, c.z));
    }

    sub(b: f32vec3x): f32vec3x {
        return new f32vec3x(f32x4.sub(this.x, b.x), f32x4.sub(this.y, b.y), f32x4.sub(this.z, b.z));
    }

    div_s(b: v128): f32vec3x {
        return new f32vec3x(f32x4.div(this.x, b), f32x4.div(this.y, b), f32x4.div(this.z, b));
    }

    div(b: f32vec3x): f32vec3x {
        return new f32vec3x(f32x4.div(this.x, b.x), f32x4.div(this.y, b.y), f32x4.div(this.z, b.z));
    }

    mul(b: f32vec3x): f32vec3x {
        return new f32vec3x(f32x4.mul(this.x, b.x), f32x4.mul(this.y, b.y), f32x4.mul(this.z, b.z));
    }

    mul_s(b: v128): f32vec3x {
        return new f32vec3x(f32x4.mul(this.x, b), f32x4.mul(this.y, b), f32x4.mul(this.z, b));
    }

    cross(b: f32vec3x): f32vec3x {
        return new f32vec3x(f32x4.relaxed_nmadd(this.z, b.y, f32x4.mul(this.y, b.z)), f32x4.relaxed_nmadd(this.x, b.z, f32x4.mul(this.z, b.x)), f32x4.relaxed_nmadd(this.y, b.x, f32x4.mul(this.x, b.y)));
    }

    dot(b: f32vec3x): v128 {
        return f32x4.add(f32x4.relaxed_madd(this.x, b.x, f32x4.mul(this.y, b.y)), f32x4.mul(this.z, b.z));
    }

    length(): v128 {
        return f32x4.sqrt(f32x4.relaxed_madd(this.x, this.x, f32x4.relaxed_madd(this.y, this.y, f32x4.mul(this.z, this.z))));
    }

    normalize(): f32vec3x {
        return new f32vec3x(this.x, this.y, this.z).div_s(this.length());
    }
}
