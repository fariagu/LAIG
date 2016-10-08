class Point {
    constructor(x, y, z){
        this.x = x;
        this.y = y;
        this.z = z;
    }
}

class Perspective {
    constructor(id, near, far, angle, from, to){
        this.id = id;
        this.near = near;
        this.far = far;
        this.angle = angle;
        this.from = from;
        this.to = to;
    }
}

class RGBA {
    constructor(r, g, b, a) {
        this.r = r;
        this.g = g;
        this.b = b;
        this.a = a;
    }
}

class Illumination {
    constructor(doublesided, local, ambient, background){
        this.doublesided = doublesided;
        this.local = local;
        this.ambient = ambient;
        this.background = background;
    }
}
