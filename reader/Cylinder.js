
/**
* CylinderBase
* @constructor
*/
function CylinderBase(scene, radius, slices) {
	CGFobject.call(this,scene);

	this.radius = radius;
	this.slices = slices;

	this.initBuffers();
};

CylinderBase.prototype = Object.create(CGFobject.prototype);
CylinderBase.prototype.constructor = CylinderBase;

CylinderBase.prototype.initBuffers = function() {


	this.vertices = [];
	this.indices = [];
	this.normals = [];
	this.texCoords = [];


	var ang = (2*Math.PI) / this.slices;
	var start = 1;
	var texCenter;


	// Circle center
	this.vertices.push(0, 0, 0);
	this.normals.push(0, 0, 1);
	this.texCoords.push(0.5, 0.5);


	for (var slice = 0; slice <= this.slices; slice++) {
		var x = Math.cos(slice * ang);
		var y = Math.sin(slice * ang);

		this.vertices.push(this.radius * x, this.radius * y, 0);
		this.normals.push(0, 0, 1);
		this.texCoords.push(0.5 + 0.5 * x, 0.5 - 0.5 * y);

		if (slice > 1)
			this.indices.push(start++, start, 0);
	}

	this.indices.push(0, start, 1);


	this.primitiveType = this.scene.gl.TRIANGLES;
	this.initGLBuffers();
};


/**
* CylinderSurface
* @constructor
*/
function CylinderSurface(scene, base, top, height, slices, stacks) {
	CGFobject.call(this,scene);

	this.base = base;
	this.top = top;
	this.height = height;
	this.slices = slices;
	this.stacks = stacks;

	this.initBuffers();
};

CylinderSurface.prototype = Object.create(CGFobject.prototype);
CylinderSurface.prototype.constructor = CylinderSurface;

CylinderSurface.prototype.initBuffers = function() {


	this.vertices = [];
	this.indices = [];
	this.normals = [];
	this.texCoords = [];


	var thetha = (2*Math.PI) / this.slices;
	var zRatio = this.height / this.stacks;
	var radiusRatio = (this.top - this.base) / this.stacks;


	for (var stack = 0; stack <= this.stacks; stack++) {
		var z = stack * zRatio;
		var radius = this.base + stack * radiusRatio;

		for (var slice = 0; slice <= this.slices; slice++) {
			var x = radius * Math.cos(slice * thetha);
			var y = radius * Math.sin(slice * thetha);
			var s = 1 - (stack / this.stacks);
			var t = 1 - (slice / this.slices);

			this.vertices.push(x, y, z);
			this.normals.push(x, y, 0);
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


/**
* Cylinder
* @constructor
*/
function Cylinder(scene, base, top, height, slices, stacks, id='cylinder') {
	CGFobject.call(this,scene);

    this.id = id;

	this.surface = new CylinderSurface(scene, base, top, height, slices, stacks);
	this.base = new CylinderBase(scene, base, slices);
	this.top = new CylinderBase(scene, top, slices);
};

Cylinder.prototype = Object.create(CGFobject.prototype);
Cylinder.prototype.constructor = Cylinder;


Cylinder.prototype.display = function() {

	this.surface.display();

	this.scene.pushMatrix();
		this.scene.rotate(Math.PI, 0, 1, 0);
		this.base.display();
	this.scene.popMatrix();

	this.scene.pushMatrix();
		this.scene.translate(0, 0, 1);
		this.top.display();
	this.scene.popMatrix();
}
