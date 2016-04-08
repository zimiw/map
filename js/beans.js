function Marker(options){
	var id = 0;
	this.id = options.id || id++;
	this.title = options.title || ('Title'+this.id);
	this.name = options.name;
}
