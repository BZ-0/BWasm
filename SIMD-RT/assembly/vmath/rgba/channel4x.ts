import f32vec3x from "../f32/vec3x";
import f32vec4x from "../f32/vec4x";
import f32vec2x from "../f32/vec2x";

//
export default class channel4x {
    constructor(public t: v128, public v: v128, public chm: [f32vec2x, f32vec2x, f32vec2x, f32vec2x]) {}

    //
    get scale(): v128 {
        const cm = this.chm[0].laneselect(this.chm[1].laneselect(this.chm[2].laneselect(new f32vec2x(f32x4.splat(1.0), f32x4.splat(1.0)), i32x4.eq(this.t, i32x4.splat(2))), i32x4.eq(this.t, i32x4.splat(1))), i32x4.eq(this.t, i32x4.splat(0)));
        const mc = new f32vec4x(cm.x, cm.y, f32x4.sub(f32x4.sub(f32x4.splat(1.0), cm.y), cm.x), f32x4.splat(1.0));
        const mw = new f32vec4x(this.chm[3].x, this.chm[3].y, f32x4.sub(f32x4.sub(f32x4.splat(1.0), this.chm[3].y), this.chm[3].x), f32x4.splat(1.0));
        return mw
            .div_s(this.chm[3].y) // Y-multipler
            .dot(new f32vec4x(f32x4.splat(1.0), f32x4.splat(1.0), f32x4.splat(1.0), f32x4.splat(1.0)).div(mc)); // RGB modifier
    }

    // you needs to compile with component XcYcZc, where c=r,g,b, using a summary (i.e. XrYrZr+XgYgZg+XbYbZb)
    get uvw(): f32vec3x {
        const cm = this.chm[0].laneselect(this.chm[1].laneselect(this.chm[2].laneselect(new f32vec2x(f32x4.splat(1.0), f32x4.splat(1.0)), i32x4.eq(this.t, i32x4.splat(2))), i32x4.eq(this.t, i32x4.splat(1))), i32x4.eq(this.t, i32x4.splat(0)));
        const mc = new f32vec3x(cm.x, cm.y, f32x4.sub(f32x4.sub(f32x4.splat(1.0), cm.y), cm.x));
        return new f32vec3x(this.v, this.v, this.v).mul_s(this.scale).mul(mc);
    }

    // you recovers only one channel uvw
    set uvw(chUVW: f32vec3x) {
        // if you needs by every r,g,b component, needs to premult every `mc` of channel
        this.v = f32x4.div(chUVW.dot(new f32vec3x(f32x4.splat(1.0), f32x4.splat(1.0), f32x4.splat(1.0))), this.scale);
    }

    // recover from full XYZ
    set fUVW(fUVW: f32vec3x) {
        const o1 = this.chm[2].laneselect(this.chm[0].laneselect(this.chm[1].laneselect(new f32vec2x(f32x4.splat(1.0), f32x4.splat(1.0)), i32x4.eq(this.t, i32x4.splat(2))), i32x4.eq(this.t, i32x4.splat(1))), i32x4.eq(this.t, i32x4.splat(0)));
        const o2 = this.chm[1].laneselect(this.chm[2].laneselect(this.chm[0].laneselect(new f32vec2x(f32x4.splat(1.0), f32x4.splat(1.0)), i32x4.eq(this.t, i32x4.splat(2))), i32x4.eq(this.t, i32x4.splat(1))), i32x4.eq(this.t, i32x4.splat(0)));

        // Xch0=1-Xch1-Xch2, Ych0=1-Ych1-Ych2, where ch0 is R,G,B, ch1 is G,B,R, ch2 is B,R,G
        this.v = f32x4.div(
            fUVW.dot(
                new f32vec3x(f32x4.splat(1.0), f32x4.splat(1.0), f32x4.splat(1.0))
                    // needs trivial for differing
                    .sub(new f32vec3x(o1.x, o1.y, f32x4.sub(f32x4.sub(f32x4.splat(1.0), o1.y), o1.x)))
                    .sub(new f32vec3x(o2.x, o2.y, f32x4.sub(f32x4.sub(f32x4.splat(1.0), o2.y), o2.x)))
            ),
            this.scale
        );
    }
}
