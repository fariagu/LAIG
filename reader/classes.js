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

//TODO: Modify Omni and Spot so they descend from a superclass
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

class Texture {
    constructor(id, file, length_s, length_t){
        this.id = id;
        this.file = file;
        this.length_s = length_s;
        this.length_t = length_t;
    }
}

class Material {
    constructor(id, emission, ambient, diffuse, specular, shininess){
        this.id = id;
        this.emission = emission;
        this.ambient = ambient;
        this.diffuse = diffuse;
        this.specular = specular;
        this.shininess = shininess;
    }
}

class Transformation {
    constructor(id, translate, rotate, scale){
        this.id = id;
        this.translate = translate;
        this.rotate = rotate;
        this.scale = scale;
    }
}

class Rotate {
    constructor(axis, angle) {
        this.axis = axis;
        this.angle = angle;
    }
}

class Primitive {
    constructor(id){
        this.id = id;
    }
}

class Rectangle extends Primitive {
    constructor(id, x1, y1, x2, y2){
        super(id);
        this.x1 = x1;
        this.y1 = y1;
        this.x2 = x2;
        this.y2 = y2;
    }
}

class Triangle extends Primitive {
    constructor(id, x1, y1, z1, x2, y2, z2, x3, y3, z3){
        super(id);
        this.x1 = x1;
        this.y1 = y1;
        this.z1 = z1;
        this.x2 = x2;
        this.y2 = y2;
        this.z2 = z2;
        this.x3 = x3;
        this.y3 = y3;
        this.z3 = z3;
    }
}

class Cylinder extends Primitive {
    constructor(id, base, top, height, slices, stacks){
        super(id);
        this.base = base;
        this.top = top;
        this.height = height;
        this.slices = slices;
        this.stacks = stacks;
    }
}

class Sphere extends Primitive {
    constructor(id, radius, slices, stacks){
        super(id);
        this.radius = radius;
        this.slices = slices;
        this.stacks = stacks;
    }
}

class Torus extends Primitive {
    constructor(id, inner, outer, slices, loops){
        super(id);
        this.inner = inner;
        this.outer = outer;
        this.slices = slices;
        this.loops = loops;
    }
}


class Component {
    constructor(id, transformationID, materials, texture, children, primitives){
        this.id = id;
        this.transformationID = transformationID;
        this.materials = materials;
        this.texture = texture;
        this.children = children;
        this.primitive = primitive;
    }
}

