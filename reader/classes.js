class Point {
    constructor(x, y, z){
        this.x = x;
        this.y = y;
        this.z = z;
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

class Illumination {
    constructor(doublesided, local, ambient, background){
        this.doublesided = doublesided;
        this.local = local;
        this.ambient = ambient;
        this.background = background;
    }
}

class Omni {
    constructor(id, enabled, location, ambient, diffuse, specular){
        this.id = id;
        this.enabled = enabled;
        this.location = location;
        this.ambient = ambient;
        this.diffuse = diffuse;
        this.specular = specular;
    }
}

class Spot {
    constructor(id, enabled, angle, exponent, target, location, ambient, diffuse, specular){
        this.id = id;
        this.enabled = enabled;
        this.angle = angle;
        this.exponent = exponent;
        this.target = target;
        this.ambient = ambient;
        this.diffuse = diffuse;
        this.specular = specular;
    }
}
