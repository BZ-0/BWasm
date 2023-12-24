export default class u32vec4x {
    constructor(public x: v128, public y: v128, public z: v128, public w: v128) {}

    add(b: u32vec4x): u32vec4x {
        return new u32vec4x(i32x4.add(this.x, b.x), i32x4.add(this.y, b.y), i32x4.add(this.z, b.z), i32x4.add(this.w, b.w));
    }
}
