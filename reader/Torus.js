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

    for (var i = 0; i <= this.loops; i++) {
        var t = i * 2 * Math.PI / this.loops;
        var st = Math.sin(t);
        var ct = Math.cos(t);

        for (var j = 0; j <= this.slices; j++) {
            var phi = j * 2 * Math.PI / this.slices;
            var sinPhi = Math.sin(phi);
            var cosPhi = Math.cos(phi);

            var x = (this.outer + (this.inner * ct)) * cosPhi;
            var y = (this.outer + (this.inner * ct)) * sinPhi
            var z = this.inner * st;
            var s = 1 - (i / this.loops);
            var t = 1 - (j / this.slices);

            this.vertices.push(x, y, z);
            this.normals.push(x, y, z);
            this.texCoords.push(s, t);
        }
    }

    for (var i = 0; i < this.loops; i++) {
        for (var j = 0; j < this.slices; j++) {
            var first = (i * (this.slices + 1)) + j;
            var second = first + this.slices + 1;

            this.indices.push(first, second + 1, second);
            this.indices.push(first, first + 1, second + 1);
        }
    }


    this.primitiveType = this.scene.gl.TRIANGLES;
    this.initGLBuffers();
};
