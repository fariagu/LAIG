
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

    var from = class {
        constructor(x, y, z){
            this.x = x;
            this.y = y;
            this.z = z;
        }
    };

    var to = class {
        constructor(x, y, z){
            this.x = x;
            this.y = y;
            this.z = z;
        }
    };

    var perspective = class Perspective {
        constructor(id, near, far, angle, from, to){
            this.id = id;
            this.near = near;
            this.far = far;
            this.angle = angle;
            this.from = from;
            this.to = to;
        }
    };


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
	
/*
 * Callback to be executed on any read error
 */
 
MySceneGraph.prototype.onXMLError=function (message) {
	console.error("XML Loading Error: "+message);	
	this.loadedOk=false;
};
