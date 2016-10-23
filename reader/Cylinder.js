function Cylinder(scene, base, top, height, slices, stacks, id = 'cylinder') {
    CGFobject.call(this, scene);

    this.id = id;
    this.base = base;
    this.top = top;
    this.height = height;
    this.slices = slices;
    this.stacks = stacks;

    this.initBuffers();
    }

Cylinder.prototype = Object.create(CGFobject.prototype);
Cylinder.prototype.constructor = Cylinder;

Cylinder.prototype.initBuffers = function() {
    this.alpha = 2 * Math.PI / this.slices;

    this.vertices = [];
    this.normals = [];
    this.indices = [];

    var base=Number(this.base);
    var top=Number(this.top);
    var nslices=Number(this.slices);
    var nstacks=Number(this.stacks);
    var height=Number(this.height);

    this.vertices.push(0, 0, -(this.height/2));
    this.normals.push(0,0,-1);

    var dif = Math.abs((base-top)/nstacks);

    for(var i=0; i < nslices + 1; i++){
        if(i != 0 && i != nslices){
            this.indices.push(0,i+1,i);
        }
        if(i == nslices) {
            this.indices.push(0,(i+1)-nslices,i);
        }
        if(i<nslices) {
            this.vertices.push(Math.cos(this.alpha*i)*base, Math.sin(this.alpha*i)*base,-(this.height/2));
            this.normals.push(0,0,-1);
        }

    }

    for(var j=0;j<nstacks+1;j++){
        for(var k=0;k<nslices;k++){
            this.vertices.push(Math.cos(this.alpha*k)*(base-(j*dif)),Math.sin(this.alpha*k)*(base-(j*dif)),-(height/2)+(height/nstacks)*j);
            this.normals.push(Math.cos(this.alpha*k)*(base-(j*dif)),Math.sin(this.alpha*k)*(base-(j*dif)),0);

            if(j!=0){
                if(k==nslices-1) {
                    this.indices.push(k+1+(j*nslices),(k+2+(j*nslices))-nslices,k+1+nslices+(j*nslices));
                }
                else {
                    this.indices.push(k+1+(j*nslices),k+2+(j*nslices),k+1+nslices+(j*nslices));
                }
            }
        }

        for(var l=0;l<nslices;l++){
            if(l==0) {
                this.indices.push((l+1)+(j*nslices),nslices+(l+1)+(j*nslices),nslices*(l+2)+(j*nslices));
            }
            else {
                this.indices.push((l+1)+(j*nslices),nslices+(l+1+(j*nslices)),nslices+l+(j*nslices));
            }
        }
    }


    for(var i=0;i<nslices;i++){
        this.vertices.push(Math.cos(this.alpha*i)*top,Math.sin(this.alpha*i)*top,this.height/2);
        this.normals.push(0,0,1);
    }

    this.vertices.push(0, 0,this.height/2);
    this.normals.push(0,0,1);
    var aux=nslices*(nstacks+3)+1;

    for(var i=0;i<nslices;i++){
       this.indices.push(aux-(i+2),aux-1,aux-(i+3));
    }

    for (var i = 2; i < this.vertices.length; i+=3){
        this.vertices[i] += height/2;
    }

    this.primitiveType = this.scene.gl.TRIANGLES;
    this.initGLBuffers();
};
