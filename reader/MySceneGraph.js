
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

};

MySceneGraph.prototype.parseIllumination= function(rootElement) {

	var elements =  rootElement.getElementsByTagName('illumination');
	if (elements == null) {
		return "illumination element is missing.";
	}


	// various examples of different types of access
	var illumination = elements[0];

    if (this.reader.getInteger(illumination, 'doublesided') == 1){
        this.doublesided = true;
    }
    else this.doublesided = false;

    if (this.reader.getInteger(illumination, 'local') == 1){
        this.local = true;
    }
    else this.local = false;

	var ambient = new RGBA();
    var background = new RGBA();

    var e=illumination.children[0];
    ambient.r = e.attributes.getNamedItem("r").value;
    ambient.g = e.attributes.getNamedItem("g").value;
    ambient.b = e.attributes.getNamedItem("b").value;
    ambient.a = e.attributes.getNamedItem("a").value;

    e=illumination.children[1];
    background.r = e.attributes.getNamedItem("r").value;
    background.g = e.attributes.getNamedItem("g").value;
    background.b = e.attributes.getNamedItem("b").value;
    background.a = e.attributes.getNamedItem("a").value;

    console.log("Illumination read from file: {doublesided=" + this.doublesided + ", local=" + this.local + "ambient=(" + ambient.r + "," + ambient.g + "," + ambient.b + "," + ambient.a + "), bg=(" + background.r + "," + background.g + "," + background.b + "," + background.a + ")" + "}");

};
	
/*
 * Callback to be executed on any read error
 */
 
MySceneGraph.prototype.onXMLError=function (message) {
	console.error("XML Loading Error: "+message);	
	this.loadedOk=false;
};
