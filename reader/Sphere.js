function Sphere(scene, radius, slices, stacks) {
    CGFobject.call(this, scene);

    this.radius = radius;
    this.slices = slices;
    this.stacks = stacks;

    this.initBuffers();
};

Sphere.prototype = Object.create(CGFobject.prototype);
Sphere.prototype.constructor = Sphere;

Sphere.prototype.initBuffers = function() {

    this.vertices = [];
    this.indices = [];
    this.normals = [];
    this.texCoords = [];

    for (var stack = 0; stack <= this.stacks; stack++) {
        var t = stack * Math.PI / this.stacks;
        var st = Math.sin(t);
        var ct = Math.cos(t);

        for (var slice = 0; slice <= this.slices; slice++) {
            var p = slice * 2 * Math.PI / this.slices;
            var sp = Math.sin(p);
            var cp = Math.cos(p);

            var x = this.radius * cp * st;
            var y = this.radius * ct;
            var z = this.radius * sp * st;
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
