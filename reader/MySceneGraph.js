
function MySceneGraph(filename, scene) {
	this.loadedOk = null;
	
	// Establish bidirectional references between scene and graph
	this.scene = scene;
	scene.graph = this;
		
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
    this.primitives = [];
    this.components = [];
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
    //var error = null;

    this.parseScene(rootElement);
    this.parseViews(rootElement);
    this.parseIllumination(rootElement);
    this.parseLights(rootElement);
    this.parseTextures(rootElement);
    this.parseMaterials(rootElement);
    this.parseTransformations(rootElement);
    this.parsePrimitives(rootElement);
    this.parseComponents(rootElement);

 /*
 //Example for traversing all nodes and their information
    console.log("MMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMM");
    for(var i = 0; i < this.components.length; i++){
        //printing component id
        console.log(i + " - " + this.components[i].id);

        //printing transformationref id
        console.log("tid: " + this.components[i].transformationID);

        //iterating materials
        for (var j = 0; j < this.components[i].materials.length; j++){
            //printing materials
            console.log("mid: " + this.components[i].materials[j]);
        }

        //printing texture
        console.log("texid: " + this.components[i].texture);

        //iterating children
        for (var j = 0; j < this.components[i].children.length; j++){
            console.log("compref: " + this.components[i].children[j]);
        }

        if (this.components[i].primitive != null){
            console.log("primref: " + this.components[i].primitive);
        }
    }
*/

	if (error != null) {
		this.onXMLError(error);
		return;
	}

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
        tmpPerspective.id = this.reader.getString(perspective[i], 'id');
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

    id = this.reader.getString(omniElement, 'id');

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

    id = this.reader.getString(spotElement, 'id');

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

    var nnodes = texture.length;
    for (var i = 0; i < nnodes; i++){
        var tmpTexture = new Texture();

        tmpTexture.id = this.reader.getString(texture[i], 'id');
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

    var nnodes = material.length;
    for (var i = 0; i < nnodes; i++){
        var tmpMaterial = new Material();

        tmpMaterial.id = this.reader.getString(material[i], 'id');

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

    var nnodes = transformation.length;
    for (var i = 0; i < nnodes; i++){
        var tmpTransformation = new Transformation();
        tmpTransformation.id = this.reader.getString(transformation[i], 'id');

        tmpTransformation.translate = this.parsePoint(transformation[i].getElementsByTagName('translate')[0]);

        for (var j = 0; j < transformation[i].getElementsByTagName('rotate').length; j++){
            tmpTransformation.rotate.push(this.parseRotate(transformation[i].getElementsByTagName('rotate')[j]));
        }

        tmpTransformation.scale = this.parsePoint(transformation[i].getElementsByTagName('scale')[0]);

        if (tmpTransformation.translate.x  == undefined){
            tmpTransformation.translate = new Point();
        }

        if (tmpTransformation.rotate.axis == undefined){
            tmpTransformation.rotate.push(new Rotate());
        }
        if (tmpTransformation.scale.x == undefined){
            tmpTransformation.scale = new Point();
        }

        console.log("id:" + tmpTransformation.id);
        console.log("translate" + this.logPoint(tmpTransformation.translate));
        for (var j = 0; j < tmpTransformation.rotate.length; j++){
            console.log("rotate: " + this.logRotate(tmpTransformation.rotate[j]));
        }
        console.log("scale" + this.logPoint(tmpTransformation.scale));

        this.transformations.push(tmpTransformation);
    }
};

MySceneGraph.prototype.parseRectangle = function(rectangleElement) {
    if (rectangleElement == null) {
		return "Rectangle Element is missing.";
	}
    var x1, y1, x2, y2;

    x1 = this.reader.getFloat(rectangleElement, 'x1');
    y1 = this.reader.getFloat(rectangleElement, 'y1');
    x2 = this.reader.getFloat(rectangleElement, 'x2');
    y2 = this.reader.getFloat(rectangleElement, 'y2');

    return new Rectangle(this.scene, x1, y1, x2, y2);
}

MySceneGraph.prototype.logRectangle = function(rectangleObject) {
   return "RECTANGLE - x1:" + rectangleObject.point1.x + ", y1:" + rectangleObject.point1.y + ", x2:" + rectangleObject.point2.x + ", y2:" + rectangleObject.point2.y;
}

MySceneGraph.prototype.parseTriangle = function(triangleElement) {
    if (triangleElement == null) {
		return "Triangle Element is missing.";
	}

    var x1, y1, z1, x2, y2, z2, x3, y3, z3;

    x1 = this.reader.getFloat(triangleElement, 'x1');
    y1 = this.reader.getFloat(triangleElement, 'y1');
    z1 = this.reader.getFloat(triangleElement, 'z1');
    x2 = this.reader.getFloat(triangleElement, 'x2');
    y2 = this.reader.getFloat(triangleElement, 'y2');
    z2 = this.reader.getFloat(triangleElement, 'z2');
    x3 = this.reader.getFloat(triangleElement, 'x3');
    y3 = this.reader.getFloat(triangleElement, 'y3');
    z3 = this.reader.getFloat(triangleElement, 'z3');

    return new Triangle(this.scene, x1, y1, z1, x2, y2, z2, x3, y3, z3);
}

MySceneGraph.prototype.logTriangle = function(triangleObject) {
   return "TRIANGLE - p1(" + triangleObject.point1.x + "," + triangleObject.point1.y + "," + triangleObject.point1.z + "), p2(" + triangleObject.point2.x + "," + triangleObject.point2.y + "," + triangleObject.point2.z + "), p3(" + triangleObject.point3.x + "," + triangleObject.point3.y + "," + triangleObject.point3.z + ")";
}

MySceneGraph.prototype.parseCylinder = function(cylinderElement) {
    if (cylinderElement == null) {
		return "Cylinder Element is missing.";
	}

    var base, top, height, slices, stacks;

    base = this.reader.getFloat(cylinderElement, 'base');
    top = this.reader.getFloat(cylinderElement, 'top');
    height = this.reader.getFloat(cylinderElement, 'height');
    slices = this.reader.getFloat(cylinderElement, 'slices');
    stacks = this.reader.getFloat(cylinderElement, 'stacks');

    return new Cylinder(this.scene, base, top, height, slices, stacks);
}

MySceneGraph.prototype.logCylinder = function(cylinderObject) {
   return "CYLINDER - base:" + cylinderObject.base + ", top:" + cylinderObject.top + ", height:" + cylinderObject.height + ", slices:" + cylinderObject.slices + ", stacks:" + cylinderObject.stacks;
}

MySceneGraph.prototype.parseSphere = function(sphereElement) {
    if (sphereElement == null) {
		return "Sphere Element is missing.";
	}

    var radius, slices, stacks;

    radius = this.reader.getFloat(sphereElement, 'radius');
    slices = this.reader.getFloat(sphereElement, 'slices');
    stacks = this.reader.getFloat(sphereElement, 'stacks');

    return new Sphere(this.scene, radius, slices, stacks);
}

MySceneGraph.prototype.logSphere = function(sphereObject) {
   return "SPHERE - radius:" + sphereObject.radius + ", slices:" + sphereObject.slices + ", stacks:" + sphereObject.stacks;
}

MySceneGraph.prototype.parseTorus = function(torusElement) {
    if (torusElement == null) {
		return "Torus Element is missing.";
	}

    var inner, outer, slices, loops;

    inner = this.reader.getFloat(torusElement, 'inner');
    outer = this.reader.getFloat(torusElement, 'outer');
    slices = this.reader.getFloat(torusElement, 'slices');
    loops = this.reader.getFloat(torusElement, 'loops');

    return new Torus(this.scene, inner, outer, slices, loops);
}

MySceneGraph.prototype.logTorus = function(torusObject) {
   return "TORUS - inner:" + torusObject.inner + ", outer:" + torusObject.outer + ", slices:" + torusObject.slices + ", loops:" + torusObject.loops;
}

MySceneGraph.prototype.parsePrimitives= function(rootElement) {

	var elements =  rootElement.getElementsByTagName('primitives');
	if (elements == null) {
		return "primitives element is missing.";
	}

    console.log("--> Parsing Primitives");

	// various examples of different types of access
	var primitivesNode = elements[0];

    var primitive = primitivesNode.getElementsByTagName('primitive');
    var nodeName;
    var tmpID;
    var tmpPrimitive;

    var nnodes = primitive.length;
    for (var i = 0; i < nnodes; i++){
        tmpID = this.reader.getString(primitive[i], 'id');

        nodeName = primitive[i].children[0].nodeName;
        childNode = primitive[i].children[0];
        console.log("nodeName:" + nodeName);

        switch (nodeName){
            case 'rectangle':
                tmpPrimitive = this.parseRectangle(childNode);
                console.log(this.logRectangle(tmpPrimitive));
                break;
            case 'triangle':
                tmpPrimitive = this.parseTriangle(childNode);
                console.log(this.logTriangle(tmpPrimitive));
                break;
            case 'cylinder':
                tmpPrimitive = this.parseCylinder(childNode);
                console.log(this.logCylinder(tmpPrimitive));
                break;
            case 'sphere':
                tmpPrimitive = this.parseSphere(childNode);
                console.log(this.logSphere(tmpPrimitive));
                break;
            case 'torus':
                tmpPrimitive = this.parseTorus(childNode);
                console.log(this.logTorus(tmpPrimitive));
                break;
            default:
                break;
        }

        this.primitives.push(tmpPrimitive);
    }
};


MySceneGraph.prototype.parseComponents= function(rootElement) {

	var elements =  rootElement.getElementsByTagName('components');
	if (elements == null) {
		return "components element is missing.";
	}

    console.log("--> Parsing Components");

    var transformationref, materialsElement, materialref, textureElement, childrenElement;
    var transfid, matid, texid, childid, primid;

    var tmpMaterials = [];
    var tmpChildren = [];

	// various examples of different types of access
	var componentsNode = elements[0];

    var component = componentsNode.getElementsByTagName('component');

    var nnodes = component.length;
    for (var i = 0; i < nnodes; i++){
        var tmpComponent = new Component();

        tmpComponent.id = this.reader.getString(component[i], 'id');
        console.log("COMPONENT id:" + tmpComponent.id);

        //---------------------------------------------------------------------------------------------------------

        //TODO: add support to inline textures in components
        transformationref = component[i].getElementsByTagName('transformationref')[0];
        transfid = this.reader.getString(transformationref, 'id');

        for (var j = 0; j < this.transformations.length; j++){
            if (transfid == this.transformations[j].id){
                tmpComponent.transformation.push(this.transformations[j]);
            }
        }

        console.log("transformation:" + tmpComponent.transformation[0].id);

        //----------------------------------------------------------------------------------------------------------

        materialsElement = component[i].getElementsByTagName('materials')[0];//materialsElement.nodeName = materials

        var jnodes = materialsElement.children.length;
        for (var j = 0; j < jnodes; j++){
            materialref = materialsElement.getElementsByTagName('material')[j];//materialref.nodeName = material

            matid = this.reader.getString(materialref, 'id');
            for (var k = 0; k < this.materials.length; k++){
                if (matid == this.materials[k].id){
                    tmpMaterials.push(this.materials[k]);
                }
            }

            console.log("material id:" + tmpMaterials[j].id);
        }

        tmpComponent.materials = tmpMaterials;
        tmpMaterials = [];

        //---------------------------------------------------------------------------------------------------------

        textureElement = component[i].getElementsByTagName('texture')[0];

        texid = this.reader.getString(textureElement, 'id');

        if (texid == 'inherit'){
            for (var j = 0; j < this.components.length; j++){
                for (var k = 0; k < this.components[j].children.length; k++){
                    if (this.components[j].children[k] == tmpComponent.id){//remember to replace with pointer and not just identifier
                        texid = this.components[j].texture.id;
                    }
                }
            }
        }

        if (texid != 'none'){
            for (var j = 0; j < this.textures.length; j++){
                if (texid == this.textures[j].id){
                    tmpComponent.texture = this.textures[j];
                }
            }
        }
        else {
            tmpComponent.texture = new Texture(texid, null, null, null);
        }

        console.log("texture id:" + tmpComponent.texture.id);

        //---------------------------------------------------------------------------------------------------------

        childrenElement = component[i].getElementsByTagName('children')[0];
        //tmpComponent.primitive = null;

        var refComponents = [];
        var tmpComponentref;


        jnodes = childrenElement.children.length;
        for (var j = 0; j < jnodes; j++){
            var childrenType = childrenElement.children[j].nodeName;

            switch(childrenType) {
                case 'componentref':
                    tmpComponentref = this.reader.getString(childrenElement.children[j], 'id');
                    console.log('componentref id:' + tmpComponentref);
                    refComponents.push(tmpComponentref);
                    break;
                case 'primitiveref':
                    primid = this.reader.getString(childrenElement.children[j], 'id');
                    for (var j = 0; j < this.primitives.length; j++){
                        if (primid == this.primitives[j].id){
                            tmpComponent.primitive = this.primitives[j];
                        }
                    }

                    console.log('primitiveref id:' + tmpComponent.primitive.id);
                    break;
                default:
                    break;
            }
        }

        tmpComponent.children = refComponents;
        refComponents = [];

        this.components.push(tmpComponent);

    }

    //replace child array of identifiers by array of actual component pointers
    for (var i = 0; i < this.components.length; i++){
        if (this.components[i].primitive == null){
            var childrenArray = [];
            for (var j = 0; j < this.components[i].children.length; j++){
                for (var k = i; k < this.components.length; k++){
                    if (this.components[i].children[j] == this.components[k].id){
                        //this.components[i].children[j] = this.components[k];
                        childrenArray.push(this.components[k]);
                    }
                }
            }
            this.components[i].children = childrenArray;
        }
    }


    for (var i = 0; i < this.components.length; i++){
        for (var j = 0; j < this.components[i].children.length; j++){
            for (var k = 0; k < this.components[i].transformation.length; k++){
                var trans = this.components[i].transformation[k];
                this.components[i].children[j].transformation.push(trans);
            }
        }
    }

    for (var i = 0; i < this.components.length; i++){
        console.log("comp-" + this.components[i].id);

        for (var j = 0; j < this.components[i].transformation.length; j++){
            console.log("--> " + this.components[i].transformation[j].id);
        }
    }
};

	
/*
 * Callback to be executed on any read error
 */
 
MySceneGraph.prototype.onXMLError=function (message) {
	console.error("XML Loading Error: "+ message);
	this.loadedOk=false;
};
