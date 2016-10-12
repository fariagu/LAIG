var degToRad = Math.PI / 180.0;
function Cylinder(scene, slices, stacks) 
{
 	CGFobject.call(this,scene);
	this.slices=slices;
	this.stacks=stacks;
 	this.vertices = [];
	this.indices = [];
	this.normals = [];
	this.texCoords = [];
	this.initBuffers();
};

 Cylinder.prototype = Object.create(CGFobject.prototype);
 Cylinder.prototype.constructor = Cylinder;

 Cylinder.prototype.initBuffers = function() 
 {
	//variaveis auxiliares
	var xi;
	var yi;
	var xf;
	var yf;
	var k=0;
	var offset=0;
	var alfa = 360 /this.slices;
	var angle=0;
	
	for (i = 0; i < this.stacks; i++) 
	{
		var t=0;
		for (j = 0; j < this.slices; j++) 
		{
			xi = Math.cos(angle*degToRad);
			yi = Math.sin(angle*degToRad);

			angle+= alfa;

			xf = Math.cos(angle*degToRad);
			yf = Math.sin(angle*degToRad);
			
			//vertices
			this.vertices.push(xi,yi,i / this.stacks);
			this.vertices.push(xf,yf,i / this.stacks);
			this.vertices.push(xi,yi,(i + 1) / this.stacks)
			this.vertices.push(xf,yf,(i + 1) / this.stacks);

 			//indices
 			offset = t + k;
			this.indices.push(offset,offset + 1,offset + 2); 
			this.indices.push(offset + 3,offset + 2,offset + 1); 

			//normais
			t += 4;
			this.normals.push(xi,yi,0);
            this.normals.push(xf,yf,0);
			this.normals.push(xi,yi,0);
            this.normals.push(xf,yf,0);	
		}			
		k += 4 * this.slices;
	}
	
	//coordenadas de textura
	for (i = 0; i < this.stacks; i++)
	{
		for (j = 0; j < this.slices; j++)
		{
			this.texCoords.push(1 - j / this.slices, i / this.stacks);
			this.texCoords.push(1 - (j + 1) / this.slices, i / this.stacks);
			this.texCoords.push(1 - j / this.slices, (i + 1) / this.stacks);
			this.texCoords.push(1 - (j + 1) / this.slices, (i + 1) / this.stacks);
		}
	}	
 	this.primitiveType = this.scene.gl.TRIANGLES;
 	this.initGLBuffers();
 };