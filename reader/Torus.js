function TorusD(scene, inner, outer, slices, loops) {
    CGFobject.call(this, scene);

    this.in = inner;
    this.out = outer;
    this.slices = slices;
    this.stacks = loops;
    this.initBuffers();
    
};

TorusD.prototype = Object.create(CGFobject.prototype);
TorusD.prototype.constructor = TorusD;

TorusD.prototype.initBuffers = function() {

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

            var x = (this.out + (this.in * ct)) * cosPhi;
            var y = (this.out + (this.in * ct)) * sinPhi
            var z = this.in * st;
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
