
function XMLscene() {
    CGFscene.call(this);
}

XMLscene.prototype = Object.create(CGFscene.prototype);
XMLscene.prototype.constructor = XMLscene;

XMLscene.prototype.init = function (application) {
    CGFscene.prototype.init.call(this, application);

    this.initCameras();

    this.initLights();

    this.gl.clearColor(0.0, 0.0, 0.0, 1.0);

    this.gl.clearDepth(100.0);
    this.gl.enable(this.gl.DEPTH_TEST);
	this.gl.enable(this.gl.CULL_FACE);
    this.gl.depthFunc(this.gl.LEQUAL);

	this.axis=new CGFaxis(this);

};

XMLscene.prototype.initLights = function () {

	this.lights[0].setPosition(2, 3, 3, 1);
    this.lights[0].setAmbient(0, 0, 0, 1);
    this.lights[0].setDiffuse(1.0, 1.0, 1.0, 1.0);
    this.lights[0].setSpecular(1.0, 1.0, 1.0, 1.0);
    this.lights[0].setVisible(true);
    this.lights[0].enable();
    this.lights[0].update();
};

XMLscene.prototype.initDSXLights = function () {
    for (var i = 0; i < this.graph.omnis.length; i++){
        var omni = this.graph.omnis[i];

        this.lights[i].setPosition(omni.location.x, omni.location.y, omni.location.z, 1);
        this.lights[i].setAmbient(omni.ambient.r, omni.ambient.g, omni.ambient.b, omni.ambient.a);
        this.lights[i].setDiffuse(omni.diffuse.r, omni.diffuse.g, omni.diffuse.b, omni.diffuse.a);
        this.lights[i].setSpecular(omni.specular.r, omni.specular.g, omni.specular.b, omni.specular.a);
        this.lights[i].setVisible(true);

        if (omni.enabled){
            this.lights[i].enable();
        }
        else {
            this.lights[i].disable();
        }

        this.lights[i].update();
    }

    for (var i = 0; i < this.graph.spots.length; i++){
        var spot = this.graph.spots[i];

        this.lights[i].setPosition(spot.location.x, spot.location.y, spot.location.z, 1);
        this.lights[i].setAmbient(spot.ambient.r, spot.ambient.g, spot.ambient.b, spot.ambient.a);
        this.lights[i].setDiffuse(spot.diffuse.r, spot.diffuse.g, spot.diffuse.b, spot.diffuse.a);
        this.lights[i].setSpecular(spot.specular.r, spot.specular.g, spot.specular.b, spot.specular.a);
        this.lights[i].setSpotExponent(spot.exponent);
        this.lights[i].setSpotDirection(spot.target.x, spot.target.y, spot.target.z);
    }
}

XMLscene.prototype.initCameras = function () {
    this.camera = new CGFcamera(0.4, 0.1, 500, vec3.fromValues(15, 15, 15), vec3.fromValues(0, 0, 0));
};

XMLscene.prototype.setDefaultAppearance = function () {
    this.setAmbient(0.2, 0.4, 0.8, 1.0);
    this.setDiffuse(0.2, 0.4, 0.8, 1.0);
    this.setSpecular(0.2, 0.4, 0.8, 1.0);
    this.setShininess(10.0);	
};

// Handler called when the graph is finally loaded. 
// As loading is asynchronous, this may be called already after the application has started the run loop
XMLscene.prototype.onGraphLoaded = function () 
{
	this.gl.clearColor(this.graph.illuminationNode.background.r,
                       this.graph.illuminationNode.background.g,
                       this.graph.illuminationNode.background.b,
                       this.graph.illuminationNode.background.a);

    this.setAmbient(   this.graph.illuminationNode.ambient.r,
                       this.graph.illuminationNode.ambient.g,
                       this.graph.illuminationNode.ambient.b,
                       this.graph.illuminationNode.ambient.a);

	this.lights[0].setVisible(true);
    this.lights[0].enable();

    this.initDSXLights();
};

XMLscene.prototype.transformation = function(node) {

    for (var i = node.transformation.length - 1; i >= 0; i--){

        if (node.transformation[i].translate != null){
            node.primitive.scene.translate( node.transformation[i].translate.x,
                                            node.transformation[i].translate.y,
                                            node.transformation[i].translate.z);
        }

        for (var j = 0; j < node.transformation[i].rotate.length; j++){

            switch(node.transformation[i].rotate[j].axis){
                case 'x':
                    node.primitive.scene.rotate(node.transformation[i].rotate[j].angle * Math.PI / 180, 1, 0, 0);
                    break;
                case 'y':
                    node.primitive.scene.rotate(node.transformation[i].rotate[j].angle * Math.PI / 180, 0, 1, 0);
                    break;
                case 'z':
                    node.primitive.scene.rotate(node.transformation[i].rotate[j].angle * Math.PI / 180, 0, 0, 1);
                    break;
                default:
                    break;
            }
        }
/*
        if (node.transformation[i].scale != null){
            node.primitive.scene.scale( node.transformation[i].scale.x,
                                        node.transformation[i].scale.y,
                                        node.transformation[i].scale.z);
        }*/
    }
};

XMLscene.prototype.processGraph = function(node) {
    var material = null;

    for (var i = 0; i < this.graph.components.length; i++){
        node = this.graph.components[i];

        if (node != null){

            if (node.materials != null){
                material = node.materials[0];

                if (material != null){
                    //this.applyMaterial(material);
                    //this.nullMatrix(node.matrix);   //<--- ??
                    if (node.primitive != null){

                        this.pushMatrix();

                        //this.applyMaterial(material);

                        this.transformation(node);
                        node.primitive.display();

                        this.popMatrix();
                    }
                }
            }
        }
    }
};

XMLscene.prototype.display = function () {
	// ---- BEGIN Background, camera and axis setup
	
	// Clear image and depth buffer everytime we update the scene
    this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

	// Initialize Model-View matrix as identity (no transformation
	this.updateProjectionMatrix();
    this.loadIdentity();

	// Apply transformations corresponding to the camera position relative to the origin
	this.applyViewMatrix();

	// Draw axis
	this.axis.display();

	this.setDefaultAppearance();
	
	// ---- END Background, camera and axis setup

	// it is important that things depending on the proper loading of the graph
	// only get executed after the graph has loaded correctly.
	// This is one possible way to do it
	if (this.graph.loadedOk){
        for (var i = 0; i < this.lights.length; i++){
            this.lights[i].update();
        }
        this.processGraph(this.graph.components[0]);
    }
};
