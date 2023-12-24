import f32vec4x from "./vmath/f32/vec4x"
import f32vec3x from "./vmath/f32/vec3x";
import f32vec2x from "./vmath/f32/vec2x";
import f32mat4s from "./vmath/f32/mat4s";

//
const chm = [new f32vec2x(f32x4.splat(0.64), f32x4.splat(0.33)), new f32vec2x(f32x4.splat(0.3), f32x4.splat(0.6)), new f32vec2x(f32x4.splat(0.15), f32x4.splat(0.06)), new f32vec2x(f32x4.splat(0.3127), f32x4.splat(0.329))];

//
const ONE_X = f32x4.splat(1.0);
const ZERO_X = f32x4.splat(0.0);
const FAR_X = f32x4.splat(10000.0);
const NEAR_X = f32x4.splat(0.0001);

//
function ray_dir(texcoord: f32vec2x, viewportSize: f32vec2x, fov: f32, direction: f32vec3x, up: f32vec3x): f32vec3x {
    const texDiff = new f32vec2x(f32x4.relaxed_madd(f32x4.splat(2.0), texcoord.x, f32x4.splat(-1.0)), f32x4.relaxed_madd(f32x4.splat(2.0), f32x4.sub(ONE_X, texcoord.y), f32x4.splat(-1.0))).mul_s(f32x4.splat(0.5));
    const angleDiff = texDiff.mul(new f32vec2x(f32x4.div(viewportSize.x, viewportSize.y), f32x4.splat(1.0))).mul_s(f32x4.splat(NativeMathf.tan(fov * 0.5)));
    const rayDirection = new f32vec3x(angleDiff.x, angleDiff.y, f32x4.splat(1.0)).normalize();
    const right = up.cross(direction).normalize();
    return rayDirection.madd(right, rayDirection.madd(up, rayDirection.mul(direction))).normalize();
}

//
function clamp_T(T: v128): v128 {
    return i32x4.relaxed_laneselect(FAR_X, f32x4.min(T, FAR_X), f32x4.lt(T, NEAR_X));
}

//
function near_T(a: v128, b: v128): v128 {
    return i32x4.relaxed_laneselect(f32x4.max(a, b), f32x4.min(a, b), v128.or(f32x4.lt(a, NEAR_X), f32x4.lt(b, NEAR_X)));
}

//
function valid_T(T: v128): v128 {
    return v128.and(f32x4.lt(T, f32x4.sub(FAR_X, NEAR_X)), f32x4.gt(T, NEAR_X));
}

//
function equal_T(T: v128, r: v128): v128 {
    return v128.and(f32x4.eq(T, r), valid_T(T));
}

//
class geometry_x {
    constructor(public type: v128, public center: f32vec3x, public v1: f32vec3x, public v2: f32vec3x) {}

    //
    intersect(r0: f32vec3x, rd: f32vec3x): v128 {
        const normal: f32vec3x = new f32vec3x(this.v1.x, this.v1.y, this.v1.z);
        const denom: v128 = normal.dot(rd);
        const plane: v128 = i32x4.relaxed_laneselect(FAR_X, f32x4.div(this.center.sub(r0).dot(normal), denom), f32x4.lt(f32x4.abs(denom), NEAR_X));

        //
        const a: v128 = rd.dot(rd);
        const s0_r0: f32vec3x = r0.sub(this.center);
        const b: v128 = f32x4.mul(rd.dot(s0_r0), f32x4.splat(2.0));
        const c: v128 = f32x4.relaxed_nmadd(this.v1.x, this.v1.x, s0_r0.dot(s0_r0));
        const d: v128 = f32x4.relaxed_nmadd(f32x4.mul(f32x4.splat(4.0), a), c, f32x4.mul(b, b));
        const sphere: v128 = i32x4.relaxed_laneselect(FAR_X, f32x4.div(f32x4.sub(f32x4.neg(b), d), f32x4.mul(f32x4.splat(2.0), a)), f32x4.lt(d, NEAR_X));

        //
        return i32x4.relaxed_laneselect(sphere, plane, i32x4.eq(this.type, i32x4.splat(0)));
    }
}

//
const objects = [new geometry_x(i32x4.splat(0), new f32vec3x(f32x4.splat(0.0), f32x4.splat(0.0), f32x4.splat(2.0)), new f32vec3x(f32x4.splat(1.0), ZERO_X, ZERO_X), new f32vec3x(ZERO_X, ZERO_X, ZERO_X)), new geometry_x(i32x4.splat(1), new f32vec3x(f32x4.splat(0.0), f32x4.splat(-2.0), f32x4.splat(0.0)), new f32vec3x(f32x4.splat(0.0), f32x4.splat(1.0), f32x4.splat(0.0)), new f32vec3x(ZERO_X, ZERO_X, ZERO_X))];

//
const NOTHING: v128 = i32x4.splat(-1);
const SPHERE_0: v128 = i32x4.splat(0);
const PLANE_0: v128 = i32x4.splat(1);

//
const CH_COUNT: i32 = 4;
const SH_SPLIT: f32 = 0.25;

//
const CH_BLACK: f32vec4x = new f32vec4x(f32x4.splat(0.01), f32x4.splat(0.01), f32x4.splat(0.01), f32x4.splat(1.0));
const CH_WHITE: f32vec4x = new f32vec4x(f32x4.splat(0.99), f32x4.splat(0.99), f32x4.splat(0.99), f32x4.splat(1.0));
const SPHERE_0_COLOR: f32vec4x = new f32vec4x(f32x4.splat(1.0), f32x4.splat(0.0), f32x4.splat(0.0), f32x4.splat(1.0));
const COLOR_MAT = new f32mat4s([f32x4(1.0, 0.0, 0.0, 0.0), f32x4(0.0, 1.0, 0.0, 0.0), f32x4(0.0, 0.0, 1.0, 0.0), f32x4(0.0, 0.0, 0.0, 1.0)]);

//
const R_SHIFT: f32 = 0.166666;
const G_SHIFT: f32 = 0.5;
const B_SHIFT: f32 = 0.833333;
const W_SHIFT: f32 = 0.5;

//
export function push_rays(x0: i32, y0: i32, x1: i32, y1: i32, outp: usize): void {
    for (let y: i32 = y0; y < y1; y++) {
        for (let x: i32 = x0; x < x1; x++) {
            const origin = new f32vec3x(f32x4.splat(0.0), f32x4.splat(0.0), f32x4.splat(-1.0));

            //
            const txc = new f32vec2x(f32x4.div(f32x4.add(f32x4.splat(<f32>x), f32x4(R_SHIFT, G_SHIFT, B_SHIFT, W_SHIFT)), f32x4.splat(<f32>x1 - <f32>x0)), f32x4.div(f32x4.splat(<f32>y), f32x4.splat(<f32>y1 - <f32>y0)));
            const direction = ray_dir(txc, new f32vec2x(f32x4.splat(<f32>x1 - <f32>x0), f32x4.splat(<f32>y1 - <f32>y0)), 3.14 / 2.0, new f32vec3x(f32x4.splat(0.0), f32x4.splat(0.0), f32x4.splat(1.0)), new f32vec3x(f32x4.splat(0.0), f32x4.splat(1.0), f32x4.splat(0.0)));

            //
            let tM = f32x4.splat(10000.0);
            let iM: v128 = i32x4.splat(-1);
            for (let i: i32 = 0; i < 2; i++) {
                const T = clamp_T(objects[i].intersect(origin, direction));
                const N = near_T(T, tM),
                    C = equal_T(N, T);
                iM = i32x4.relaxed_laneselect(i32x4.splat(i), iM, C);
                tM = i32x4.relaxed_laneselect(N, tM, C);
            }

            //
            let rgbw = new f32vec4x(ONE_X, ONE_X, ONE_X, ONE_X);
            let hitw = direction.madd(new f32vec3x(tM, tM, tM), origin);

            //
            if (v128.any_true(i32x4.eq(iM, PLANE_0))) {
                const rx = v128.and(i32x4.trunc_sat_f32x4_s(f32x4.floor(hitw.x)), i32x4.splat(1));
                const ry = v128.and(i32x4.trunc_sat_f32x4_s(f32x4.floor(hitw.z)), i32x4.splat(1));
                const ch = i32x4.eq(v128.xor(rx, ry), i32x4.splat(1));

                //
                rgbw = rgbw.laneselect_n(CH_BLACK.laneselect(CH_WHITE, ch), i32x4.eq(iM, PLANE_0));
            }

            //
            if (v128.any_true(i32x4.eq(iM, SPHERE_0))) {
                rgbw = rgbw.laneselect_n(SPHERE_0_COLOR, i32x4.eq(iM, SPHERE_0));
            }

            //
            const mt = i32x4.trunc_sat_f32x4_u(f32x4.mul(COLOR_MAT.mud(rgbw), f32x4.splat(255.0)));
            f32.store(outp + (x + y * (x1 - x0)) * 4, f32x4.extract_lane(i8x16.swizzle(mt, i8x16(0, 4, 8, 12, 1, 5, 9, 13, 2, 6, 10, 14, 3, 7, 11, 15)), 0));
        }
    }
}

export function alloc(size: usize): usize {
    return heap.alloc(size);
}
