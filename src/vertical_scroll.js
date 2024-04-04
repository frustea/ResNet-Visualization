function VerticalScroll(index, parent, color_function, n_items, width, on_click){
	this.index = index ; 
	this.parent = parent; 
	this.n_items = n_items; 
	this.color_function = color_function
	this.width = width
	this.on_click = on_click

	var output = "<div class='features-wrapper'> ";
	for(var j=0;j<this.n_items;j++)	
		output += "<div class='feature' style='background: rgba(255,255,255,0.15);'>" + (j+1) + "</div>";
	output += "</div>";
	this.parent.innerHTML = output;
	this.items = this.parent.getElementsByClassName('feature');
	this.hovered_feature = 0;

	this.cache_sizes();
	this.override_hover();
	this.set_on_click_item();
	this.set_on_scroll_function();
	this.fix_css();
}


VerticalScroll.prototype.hover_function_generator = function(index){
	var scroll = this; 
	return function(){	scroll.hover(index);	};
};

VerticalScroll.prototype.override_hover = function(){
	for(var i=0;i <this.n_items;i++)	this.items[i].onmouseenter = this.hover_function_generator(i);
};

VerticalScroll.prototype.hover = function(index){
	if (this.hovered_feature == index)	return;
	this.set_item_size(this.items[this.hovered_feature], 1);
	this.hovered_feature = index;
	this.set_item_size(this.items[this.hovered_feature], 2);
};

VerticalScroll.prototype.fix_css = function(){
	var css = 	"display: flex; border: 1px solid white;  margin: 0 auto; text-align: center; align-items: center; justify-content: center; margin-top: 10px; background: rgba(255,255,255,0.2);" ; 
	for(var i=0;i<this.n_items;i++)	{
		this.items[i].style.cssText = css ;
		this.set_item_size(this.items[i], 1);
	}
}

VerticalScroll.prototype.cache_sizes = function() {
	this.vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
	this.vh = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0);
	this.fix_item_sizes();

}

VerticalScroll.prototype.set_item_size = function(element, size){
	width = this.width * this.vw * size * 0.01;
	if(element == null) return ;
	element.style.width = Math.floor(width) + "px";
	element.style.height = Math.floor(width) + "px";
	element.style.borderRadius = Math.floor(width * 0.5) + "px";
};

VerticalScroll.prototype.fix_item_sizes = function(){
	for(var i=0;i<this.n_items;i++)	this.set_item_size(this.items[i], 1);
};

VerticalScroll.prototype.set_on_scroll_function = function(){
	var scroll = this;
	var container = this.parent.parentNode; 
	container.onscroll = function() {
		var relative = container.scrollTop / (container.scrollHeight - container.offsetHeight);
		var index = Math.floor(clamp(relative) * (scroll.n_items - 1));
		scroll.hover(index);
	};
};

VerticalScroll.prototype.on_click_generator = function(index){
	var scroll = this; 
	return function(){	return scroll.on_click_item(index); } ; 
};

VerticalScroll.prototype.set_on_click_item = function() {
	for(var i=0;i<this.n_items;i++)	this.items[i].onclick = this.on_click_generator(i);
};

VerticalScroll.prototype.on_click_item = function(index){
	this.on_click(this.index, this.hovered_feature);
	if (event.stopPropagation) { 
            event.stopPropagation(); 
    } 
    else if(window.event) { 
        window.event.cancelBubble=true; 
    }
};

function clamp(x){
	return Math.max(Math.min(x, 1), 0);
}