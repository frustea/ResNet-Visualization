

function HorizontalScroll(id, n_layers, width = 98, height = 50, each_layer_width = 5, layer_percent_height = 0.5, 
	color_function = get_color, no_features, on_click){
	this.id = id; 
	this.canvas = document.getElementById(this.id); 
	this.n_layers = n_layers;
	this.width = width; 
	this.height = height;
	this.each_layer_width = each_layer_width; 
	this.layer_percent_height = layer_percent_height;
	this.color_function = color_function
	this.no_features = no_features
	this.on_click = on_click

	var content = '<div class="block-div">';
	content += '<div class="outer-wrapper" id="outer" style="overflow-x: hidden">';
	content += '<div class="inner-wrapper" id="inner">';
	content += '</div></div></div>';		
	this.canvas.innerHTML = content;
	this.block = this.canvas.getElementsByClassName("block-div")[0];
	this.outer = this.block.getElementsByClassName("outer-wrapper")[0];
	this.inner = this.outer.getElementsByClassName("inner-wrapper")[0]; 

	content = '';
	for(var i=0;i<n_layers;i++)	content += '<div class="layer"> <div class="features-wrapper"> ' + (i+1) + ' </div> </div>';
	this.inner.innerHTML = content;
	this.layers = this.inner.getElementsByClassName("layer");

	this.cache_sizes();
	this.paint();
	this.override_hover();
	this.set_on_scroll_function();
	this.hovered_layer = 0;
	this.color_layers();
	this.set_on_click_layer();
	this.cache_sizes();
}

HorizontalScroll.prototype.cache_sizes = function(){
	this.vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
	this.vh = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0);

	this.fix_layers_sizes();
}

HorizontalScroll.prototype.paint = function(){
	var css_inner = "display: flex; flex-direction: row; width: " + this.each_layer_width*this.n_layers +"vw; height: " + this.height + "vh; transform: rotate(90deg) translateY(-" + this.height + "vh); transform-origin: top left; justify-content: center; align-items: center;"; 
	this.inner.style.cssText = css_inner; 
	pls = this.block.parentNode.parentNode.offsetWidth-34
	
	

	var css_outer = "text-align: center; border: 1px solid black; width: " + this.height +"vh; height: " + pls +"px; transform: rotate(-90deg) translateX(-" + this.height + "vh); transform-origin: top left; overflow-y: scroll; overflow-x: hidden; scrollbar-width: none; -ms-overflow-style: none;"
	this.outer.style.cssText= css_outer;

	this.block.style.cssText= "			height: " + this.height + "vh;";

	var css_layer = "background: blue;	text-align: center;	margin: 2px;	overflow-y: scroll;	position: relative; ";
	var css_features = "position: absolute; top: 50%; left: 50%; transition: translateX(-50%); -webkit-transform: translateX(-50%); color: white;";
	for(var i=0;i<this.n_layers;i++){
		
		this.layers[i].style.cssText = css_layer;
		this.layers[i].getElementsByClassName('features-wrapper')[0].style.cssText = css_features;
	}	
};

 HorizontalScroll.prototype.hover_function_generator = function(index){
 	var scroll = this; 
 	return function(){	scroll.hover(index);	};
 };

HorizontalScroll.prototype.override_hover = function(){
	for(var i=0;i <this.layers.length;i++)	this.layers[i].onmouseenter = this.hover_function_generator(i);
};

HorizontalScroll.prototype.hover = function(index){
	if (this.hovered_layer == index)	return;
	this.hovered_feature = 0;
	this.set_layer_size(this.layers[this.hovered_layer], 1);
	this.destroy_features(this.hovered_layer);
	this.hovered_layer = index;
	this.set_layer_size(this.layers[this.hovered_layer], 2);
};

HorizontalScroll.prototype.set_layer_size = function(element, size){
	//width = 2000;
	 width = this.each_layer_width * this.vw * size * 0.01;
	element.style.width = Math.floor(width) + "px";
	element.style.height = Math.floor(0.01 * this.layer_percent_height * this.height * this.vh * size) + "px";
	element.style.borderRadius = Math.floor(width  * 5 / 12) + "px";
};

HorizontalScroll.prototype.fix_layers_sizes = function(){
	for(var i=0;i<this.layers.length;i++)	this.set_layer_size(this.layers[i], 1);
};

HorizontalScroll.prototype.color_layers = function(){
	for(var i=0;i<this.layers.length;i++){
		var color = this.color_function(i, this.n_layers); 
		this.layers[i].style.background = color; 
	}
};

HorizontalScroll.prototype.destroy_features = function(index){
	this.layers[index].getElementsByClassName('features-wrapper')[0].innerHTML = index+1 ;
};

HorizontalScroll.prototype.set_on_scroll_function = function(){
	var scroll = this;
	var container = scroll.outer; 
	container.onscroll = function() {
		var relative = container.scrollTop / (container.scrollHeight - container.offsetHeight);
		var index = Math.floor(clamp(relative) * (scroll.n_layers - 1));
		scroll.hover(index);
	};
};

HorizontalScroll.prototype.on_click_generator = function(index){
	var scroll = this; 
	return function(){	scroll.on_click_layer(index); } ; 
};

HorizontalScroll.prototype.set_on_click_layer = function() {
	for(var i=0;i<this.n_layers;i++)	this.layers[i].onclick = this.on_click_generator(i);
};

HorizontalScroll.prototype.on_click_layer = function(index){
	var feature_wrapper = this.layers[index].getElementsByClassName("features-wrapper")[0];
	var features = new VerticalScroll(index, feature_wrapper, null, this.no_features[index], 
		this.each_layer_width * 0.7, this.on_click);
};

function clamp(x){
	return Math.max(Math.min(x, 1), 0);
}