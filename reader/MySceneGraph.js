
function MySceneGraph(filename, scene) {
	this.loadedOk = null;
	
	// Establish bidirectional references between scene and graph
	this.scene = scene;
	scene.graph=this;
		
	// File reading 
	this.reader = new CGFXMLreader();

	/*
	 * Read the contents of the xml file, and refer to this class for loading and error handlers.
	 * After the file is read, the reader calls onXMLReady on this object.
	 * If any error occurs, the reader calls onXMLError on this object, with an error message
	 */
	 
	this.reader.open('scenes/'+filename, this);  

    //Initializing arrays/variables
    this.perspectives = [];
    this.illuminationNode = new Illumination();
    //TODO: replace omni and spot arrays by a single lights array
    this.omnis = [];
    this.spots = [];
    this.textures = [];
    this.materials = [];
    this.transformations = [];
}

/*
 * Callback to be executed after successful reading
 */
MySceneGraph.prototype.onXMLReady=function() 
{
	console.log("XML Loading finished.");
	var rootElement = this.reader.xmlDoc.documentElement;
	
	// Here should go the calls for different functions to parse the various blocks
	var error = this.parseGlobalsExample(rootElement);

	if (error != null) {
		this.onXMLError(error);
		return;
	}	

    this.parseScene(rootElement);
    this.parseViews(rootElement);
    this.parseIllumination(rootElement);
    this.parseLights(rootElement);
    this.parseTextures(rootElement);
    this.parseMaterials(rootElement);
    this.parseTransformations(rootElement);

	this.loadedOk=true;
	
	// As the graph loaded ok, signal the scene so that any additional initialization depending on the graph can take place
	this.scene.onGraphLoaded();
};



/*
 * Example of method that parses elements of one block and stores information in a specific data structure
 */
MySceneGraph.prototype.parseGlobalsExample= function(rootElement) {
	
	var elems =  rootElement.getElementsByTagName('globals');
	if (elems == null) {
		return "globals element is missing.";
	}

	if (elems.length != 1) {
		return "either zero or more than one 'globals' element found.";
	}

	// various examples of different types of access
	var globals = elems[0];
	this.background = this.reader.getRGBA(globals, 'background');
	this.drawmode = this.reader.getItem(globals, 'drawmode', ["fill","line","point"]);
	this.cullface = this.reader.getItem(globals, 'cullface', ["back","front","none", "frontandback"]);
	this.cullorder = this.reader.getItem(globals, 'cullorder', ["ccw","cw"]);

	console.log("Globals read from file: {background=" + this.background + ", drawmode=" + this.drawmode + ", cullface=" + this.cullface + ", cullorder=" + this.cullorder + "}");

	var tempList=rootElement.getElementsByTagName('list');

	if (tempList == null  || tempList.length==0) {
		return "list element is missing.";
	}
	
	this.list=[];
	// iterate over every element
	var nnodes=tempList[0].children.length;
	for (var i=0; i< nnodes; i++)
	{
		var e=tempList[0].children[i];

		// process each element and store its information
		this.list[e.id]=e.attributes.getNamedItem("coords").value;
		console.log("Read list item id "+ e.id+" with value "+this.list[e.id]);
	};

};


MySceneGraph.prototype.parseRGBA = function(RGBAElement) {
    if (RGBAElement == null) {
		return "RGBA element is missing.";
	}

    var r, g, b, a;

    r = this.reader.getFloat(RGBAElement, 'r');
    g = this.reader.getFloat(RGBAElement, 'g');
    b = this.reader.getFloat(RGBAElement, 'b');
    a = this.reader.getFloat(RGBAElement, 'a');

    return new RGBA(r, g, b, a);
}

MySceneGraph.prototype.logRGBA = function(RGBAObject) {
   return "(" + RGBAObject.r + "," + RGBAObject.g + "," + RGBAObject.b + "," + RGBAObject.a + ")";
}

MySceneGraph.prototype.parsePoint = function(pointElement) {
    if (pointElement == null) {
		return "Point Element is missing.";
	}

    var x, y, z;

    x = this.reader.getFloat(pointElement, 'x');
    y = this.reader.getFloat(pointElement, 'y');
    z = this.reader.getFloat(pointElement, 'z');

    return new Point(x, y, z);
}

MySceneGraph.prototype.logPoint = function(pointObject) {
   return "(" + pointObject.x + "," + pointObject.y + "," + pointObject.z + ")";
}

MySceneGraph.prototype.parseScene= function(rootElement) {

	var elements =  rootElement.getElementsByTagName('scene');
	if (elements == null) {
		return "scene element is missing.";
	}

	if (elements.length != 1) {
		return "either zero or more than one 'scene' element found.";
	}

	// various examples of different types of access
	var scene = elements[0];
	this.root = this.reader.getString(scene, 'root');
	this.axis_length = this.reader.getInteger(scene, 'axis_length');

	console.log("Scene read from file: {root=" + this.root + ", axis length=" + this.axis_length + "}");

};

MySceneGraph.prototype.parseViews= function(rootElement) {

	var elements =  rootElement.getElementsByTagName('views');
	if (elements == null) {
		return "views element is missing.";
	}

	// various examples of different types of access
	var views = elements[0];
	this.default = this.reader.getString(views, 'default');

	console.log("Views read from file: {default=" + this.default + "}");

    var perspective = views.getElementsByTagName('perspective');
    var tmpPerspective = new Perspective();

    var nnodes = perspective.length;
    for (var i = 0; i < nnodes; i++){
        tmpPerspective.id = this.reader.getInteger(perspective[i], 'id');
        tmpPerspective.near = this.reader.getFloat(perspective[i], 'near');
        tmpPerspective.far= this.reader.getFloat(perspective[i], 'far');
        tmpPerspective.angle = this.reader.getFloat(perspective[i], 'angle');
        tmpPerspective.from = this.parsePoint(perspective[i].getElementsByTagName('from')[0]);
        tmpPerspective.to = this.parsePoint(perspective[i].getElementsByTagName('to')[0]);

        console.log("id:" + tmpPerspective.id + " from" + this.logPoint(tmpPerspective.from));
        console.log("id:" + tmpPerspective.id + " to" + this.logPoint(tmpPerspective.to));

        this.perspectives.push(tmpPerspective);
    }
};

MySceneGraph.prototype.parseIllumination= function(rootElement) {

	var elements =  rootElement.getElementsByTagName('illumination');
	if (elements == null) {
		return "illumination element is missing.";
	}


	// various examples of different types of access
	var illumination = elements[0];

    if (this.reader.getInteger(illumination, 'doublesided') == 1){
        this.illuminationNode.doublesided = true;
    }
    else this.illuminationNode.doublesided = false;

    if (this.reader.getInteger(illumination, 'local') == 1){
        this.illuminationNode.local = true;
    }
    else this.illuminationNode.local = false;

    console.log("Illumination read from file: {doublesided=" + this.illuminationNode.doublesided + ", local=" + this.illuminationNode.local + "}");

    this.illuminationNode.ambient = this.parseRGBA(illumination.getElementsByTagName('ambient')[0]);
    this.illuminationNode.background = this.parseRGBA(illumination.getElementsByTagName('background')[0]);

    console.log("ambient" + this.logRGBA(this.illuminationNode.ambient));
    console.log("background" + this.logRGBA(this.illuminationNode.background));

};

MySceneGraph.prototype.parseOmni = function(omniElement) {
    if (omniElement == null) {
		return "Omni Element is missing.";
	}

    var id, enabled, location, ambient, diffuse, specular;

    id = this.reader.getInteger(omniElement, 'id');

    if (this.reader.getInteger(omniElement, 'enabled') == 1){
        enabled = true;
    }
    else enabled = false;

    location = this.parsePoint(omniElement.getElementsByTagName('location')[0]);
    ambient = this.parseRGBA(omniElement.getElementsByTagName('ambient')[0]);
    diffuse = this.parseRGBA(omniElement.getElementsByTagName('diffuse')[0]);
    specular = this.parseRGBA(omniElement.getElementsByTagName('specular')[0]);

    console.log("OMNI - id:" + id);
    console.log("enabled:" + enabled);
    console.log("location" + this.logPoint(location));
    console.log("ambient" + this.logRGBA(ambient));
    console.log("diffuse" + this.logRGBA(diffuse));
    console.log("specular" + this.logRGBA(specular));

    return new Omni(id, enabled, location, ambient, diffuse, specular);
}

MySceneGraph.prototype.parseSpot = function(spotElement) {
    if (spotElement == null) {
		return "Spot Element is missing.";
	}

    var id, enabled, angle, exponent, target, location, ambient, diffuse, specular;

    id = this.reader.getInteger(spotElement, 'id');

    if (this.reader.getInteger(spotElement, 'enabled') == 1){
        enabled = true;
    }
    else enabled = false;

    angle = this.reader.getFloat(spotElement, 'angle');
    exponent = this.reader.getFloat(spotElement, 'exponent');

    target = this.parsePoint(spotElement.getElementsByTagName('target')[0]);
    location = this.parsePoint(spotElement.getElementsByTagName('location')[0]);
    ambient = this.parseRGBA(spotElement.getElementsByTagName('ambient')[0]);
    diffuse = this.parseRGBA(spotElement.getElementsByTagName('diffuse')[0]);
    specular = this.parseRGBA(spotElement.getElementsByTagName('specular')[0]);

    console.log("SPOT - id:" + id);
    console.log("enabled:" + enabled);
    console.log("angle:" + angle);
    console.log("exponent:" + exponent);
    console.log("target" + this.logPoint(target));
    console.log("location" + this.logPoint(location));
    console.log("ambient" + this.logRGBA(ambient));
    console.log("diffuse" + this.logRGBA(diffuse));
    console.log("specular" + this.logRGBA(specular));

    return new Spot(id, enabled, angle, exponent, target, location, ambient, diffuse, specular);
}

MySceneGraph.prototype.parseLights= function(rootElement) {

	var elements =  rootElement.getElementsByTagName('lights');
	if (elements == null) {
		return "Lights element is missing.";
	}

    console.log("--> Parsing Lights");

	// various examples of different types of access

	var lights = elements[0];

    //TODO: make it possible to parse more than one omni and/or spot element
    this.omnis.push(this.parseOmni(lights.getElementsByTagName('omni')[0]));
    this.spots.push(this.parseSpot(lights.getElementsByTagName('spot')[0]));

};

MySceneGraph.prototype.parseTextures= function(rootElement) {

	var elements =  rootElement.getElementsByTagName('textures');
	if (elements == null) {
		return "textures element is missing.";
	}

    console.log("--> Parsing Textures");

	// various examples of different types of access
	var texturesNode = elements[0];

    var texture = texturesNode.getElementsByTagName('texture');
    var tmpTexture = new Texture();

    var nnodes = texture.length;
    for (var i = 0; i < nnodes; i++){
        tmpTexture.id = this.reader.getInteger(texture[i], 'id');
        tmpTexture.file = this.reader.getString(texture[i], 'file');
        tmpTexture.length_s= this.reader.getFloat(texture[i], 'length_s');
        tmpTexture.length_t = this.reader.getFloat(texture[i], 'length_t');

        console.log("id:" + tmpTexture.id);
        console.log("file:" + tmpTexture.file);
        console.log("length_s:" + tmpTexture.length_s);
        console.log("length_t:" + tmpTexture.length_t);

        this.textures.push(tmpTexture);
    }
};

MySceneGraph.prototype.parseMaterials= function(rootElement) {

	var elements =  rootElement.getElementsByTagName('materials');
	if (elements == null) {
		return "materials element is missing.";
	}

    console.log("--> Parsing Materials");

	// various examples of different types of access
	var materialsNode = elements[0];

    var material = materialsNode.getElementsByTagName('material');
    var tmpMaterial = new Material();

    var nnodes = material.length;
    for (var i = 0; i < nnodes; i++){
        tmpMaterial.id = this.reader.getInteger(material[i], 'id');

        tmpMaterial.emission = this.parseRGBA(material[i].getElementsByTagName('emission')[0]);
        tmpMaterial.ambient = this.parseRGBA(material[i].getElementsByTagName('ambient')[0]);
        tmpMaterial.diffuse = this.parseRGBA(material[i].getElementsByTagName('diffuse')[0]);
        tmpMaterial.specular = this.parseRGBA(material[i].getElementsByTagName('specular')[0]);
        tmpMaterial.shininess = this.reader.getFloat(material[i].getElementsByTagName('shininess')[0], 'value');

        console.log("id:" + tmpMaterial.id);
        console.log("emission" + this.logRGBA(tmpMaterial.emission));
        console.log("ambient" + this.logRGBA(tmpMaterial.ambient));
        console.log("diffuse" + this.logRGBA(tmpMaterial.diffuse));
        console.log("specular" + this.logRGBA(tmpMaterial.specular));
        console.log("shininess=" + tmpMaterial.shininess);

        this.materials.push(tmpMaterial);
    }
};

MySceneGraph.prototype.parseRotate = function(rotateElement) {
    if (rotateElement == null) {
		return "rotate element is missing.";
	}

    var axis, angle;

    axis = this.reader.getString(rotateElement, 'axis');
    angle = this.reader.getFloat(rotateElement, 'angle');

    return new Rotate(axis, angle);
}

MySceneGraph.prototype.logRotate = function(rotateObject) {
   return "axis:" + rotateObject.axis + " angle:" + rotateObject.angle;
}

MySceneGraph.prototype.parseTransformations= function(rootElement) {

	var elements =  rootElement.getElementsByTagName('transformations');
	if (elements == null) {
		return "transformations element is missing.";
	}

    console.log("--> Parsing Transformations");

	// various examples of different types of access
	var transformationsNode = elements[0];

    var transformation = transformationsNode.getElementsByTagName('transformation');
    var tmpTransformation = new Transformation();

    var nnodes = transformation.length;
    for (var i = 0; i < nnodes; i++){
        tmpTransformation.id = this.reader.getInteger(transformation[i], 'id');

        tmpTransformation.translate = this.parsePoint(transformation[i].getElementsByTagName('translate')[0]);
        tmpTransformation.rotate = this.parseRotate(transformation[i].getElementsByTagName('rotate')[0]);
        tmpTransformation.scale = this.parsePoint(transformation[i].getElementsByTagName('scale')[0]);

        console.log("id:" + tmpTransformation.id);
        console.log("translate" + this.logPoint(tmpTransformation.translate));
        console.log("rotate: " + this.logRotate(tmpTransformation.rotate));
        console.log("scale" + this.logPoint(tmpTransformation.scale));

        this.transformations.push(tmpTransformation);
    }
};
	
/*
 * Callback to be executed on any read error
 */
 
MySceneGraph.prototype.onXMLError=function (message) {
	console.error("XML Loading Error: "+ message);
	this.loadedOk=false;
};
