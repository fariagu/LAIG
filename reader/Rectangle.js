function Rectangle(scene, x1, y1, x2, y2, id = 'rectangle', minS = 0, maxS = 1, minT = 0, maxT = 1) {
    CGFobject.call(this, scene);

    this.id = id;
    this.minS = minS;
    this.maxS = maxS;
    this.minT = minT;
    this.maxT = maxT;

    this.point1 = new Point(x1, x2, 0);
    this.point2 = new Point(y1, y2, 0);
    
    this.initBuffers();
};

Rectangle.prototype = Object.create(CGFobject.prototype);
Rectangle.prototype.constructor = Rectangle;

Rectangle.prototype.initBuffers = function() {
    this.vertices = [
        this.point1.x, this.point1.y, 0,
        this.point2.x, this.point1.y, 0,
        this.point2.x, this.point2.y, 0,
        this.point1.x, this.point2.y, 0
    ];

    this.indices = [
        0, 1, 2,
        2, 3, 0
    ];

    this.normals = [
        0, 0, 1,
        0, 0, 1,
        0, 0, 1,
        0, 0, 1
    ];

    this.texCoords = [
      0, 0,
      1, 0,
      0.5, 1
    ];

    this.primitiveType = this.scene.gl.TRIANGLES;
    this.initGLBuffers();
};
