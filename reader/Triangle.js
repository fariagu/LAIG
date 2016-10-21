 function Triangle(scene, x1, y1, z1, x2, y2, z2, x3, y3, z3, id = 'triangle') {
     CGFobject.call(this,scene);

     this.id = id;
     this.point1 = new Point(x1, y1, z1);
     this.point2 = new Point(x2, y2, z2);
     this.point3 = new Point(x3, y3, z3);

     this.initBuffers();
 };

 Triangle.prototype = Object.create(CGFobject.prototype);
 Triangle.prototype.constructor = Triangle;

 Triangle.prototype.initBuffers = function() {
 	this.vertices = [
    this.point1.x, this.point1.y, this.point1.z,
    this.point2.x, this.point2.y, this.point2.z,
    this.point3.x, this.point3.y, this.point3.z
 	];

 	this.indices = [
 	  0, 1, 2,
      2, 1, 0
 	];

 	
 	this.normals = [
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
