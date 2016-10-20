function Torus(scene, inner, outer, slices, loops, id = 'torus') {
    CGFobject.call(this, scene);

    this.id = id;
    this.inner = inner;
    this.outer = outer;
    this.slices = slices;
    this.loops = loops;
    this.initBuffers();
    
};

Torus.prototype = Object.create(CGFobject.prototype);
Torus.prototype.constructor = Torus;

Torus.prototype.initBuffers = function() {

    this.vertices = [];
    this.indices = [];
    this.normals = [];
    this.texCoords = [];

    for (var stack = 0; stack <= this.stacks; stack++) {
        var t = stack * 2 * Math.PI / this.stacks;
        var st = Math.sin(t);
        var ct = Math.cos(t);

        for (var slice = 0; slice <= this.slices; slice++) {
            var phi = slice * 2 * Math.PI / this.slices;
            var sinPhi = Math.sin(phi);
            var cosPhi = Math.cos(phi);

            var x = (this.outer + (this.inner * ct)) * cosPhi;
            var y = (this.outer + (this.inner * ct)) * sinPhi
            var z = this.inner * st;
            var s = 1 - (stack / this.stacks);
            var t = 1 - (slice / this.slices);

            this.vertices.push(x, y, z);
            this.normals.push(x, y, z);
            this.texCoords.push(s, t);
        }
    }

    for (var stack = 0; stack < this.stacks; stack++) {
        for (var slice = 0; slice < this.slices; slice++) {
            var first = (stack * (this.slices + 1)) + slice;
            var second = first + this.slices + 1;

            this.indices.push(first, second + 1, second);
            this.indices.push(first, first + 1, second + 1);
        }
    }


    this.primitiveType = this.scene.gl.TRIANGLES;
    this.initGLBuffers();
};
