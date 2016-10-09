
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

MySceneGraph.prototype.parsePoint = function(PointElement) {
    if (PointElement == null) {
		return "Point Element is missing.";
	}

    var x, y, z;

    x = this.reader.getFloat(PointElement, 'x');
    y = this.reader.getFloat(PointElement, 'y');
    z = this.reader.getFloat(PointElement, 'z');

    return new Point(x, y, z);
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
        tmpPerspective.near = this.reader.getString(perspective[i], 'near');
        tmpPerspective.far= this.reader.getString(perspective[i], 'far');
        tmpPerspective.angle = this.reader.getString(perspective[i], 'angle');
        tmpPerspective.from = this.parsePoint(perspective[i].getElementsByTagName('from')[0]);
        tmpPerspective.to = this.parsePoint(perspective[i].getElementsByTagName('to')[0]);

        console.log("id:" + tmpPerspective.id + " from(" + tmpPerspective.from.x + "," + tmpPerspective.from.y + "," + tmpPerspective.from.z + ")");
        console.log("id:" + tmpPerspective.id + " to(" + tmpPerspective.to.x + "," + tmpPerspective.to.y + "," + tmpPerspective.to.z + ")");

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


    console.log("ambient(" + this.illuminationNode.ambient.r + "," + this.illuminationNode.ambient.g + "," + this.illuminationNode.ambient.b + "," + this.illuminationNode.ambient.a + ")");
    console.log("background(" + this.illuminationNode.background.r + "," + this.illuminationNode.background.g + "," + this.illuminationNode.background.b + "," + this.illuminationNode.background.a + ")");

};

MySceneGraph.prototype.parseLights= function(rootElement) {

	var elements =  rootElement.getElementsByTagName('lights');
	if (elements == null) {
		return "lights element is missing.";
	}

	// various examples of different types of access

	var lights = elements[0];

    var omni = lights.rootElement.getElementsByTagName('omni');
/*
	this.perspectives=[];

    var from = new Point();
    var to = new Point();
    var perspective = new Perspective();

    // iterate over every element
	var nnodes=views.children.length;
	for (var i=0; i< nnodes; i++)
	{
		var e=views.children[i];

		// process each element and store its information
		perspective.id = e.attributes.getNamedItem("id").value;
        perspective.near = e.attributes.getNamedItem("near").value;
        perspective.far = e.attributes.getNamedItem("far").value;
        perspective.angle = e.attributes.getNamedItem("angle").value;

        var p = e.children[0];
        //console.log(p.attributes.getNamedItem("x").value + " aqui boi - i=" + i + " j=" + j);
        from.x = p.attributes.getNamedItem("x").value;
        from.y = p.attributes.getNamedItem("y").value;
        from.z = p.attributes.getNamedItem("z").value;
        perspective.from = from;

        p = e.children[1];
        //console.log(p.attributes.getNamedItem("x").value + " aqui boi - i=" + i + " j=" + j);
        to.x = p.attributes.getNamedItem("x").value;
        to.y = p.attributes.getNamedItem("y").value;
        to.z = p.attributes.getNamedItem("z").value;
        perspective.to = to;

        this.perspectives.push(perspective);
		console.log("Read perspective item: {id="+ perspective.id + " near=" + perspective.near + " far=" + perspective.far + " angle=" + perspective.angle + "from=(" + perspective.from.x  + "," + perspective.from.y + "," + perspective.from.z + ")" + "to=(" + perspective.to.x  + "," + perspective.to.y + "," + perspective.to.z + ")" + "}" );
	};
*/
};
	
/*
 * Callback to be executed on any read error
 */
 
MySceneGraph.prototype.onXMLError=function (message) {
	console.error("XML Loading Error: "+message);	
	this.loadedOk=false;
};
