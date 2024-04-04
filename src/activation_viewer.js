function ajax_get(url, callback) {
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
            try {
                var data = JSON.parse(xmlhttp.responseText);
            } catch(err) {
                console.log(err.message + " in " + xmlhttp.responseText);
                return;
            }
            callback(data);
        }
    };
 
    xmlhttp.open("GET", url, true);
    xmlhttp.send();
}

// function get_max(arr){
// 	if(Array.isArray(arr)) {
// 		var ret = get_max(arr[0]); 
// 		for(var i=1;i<arr.length;i++){
// 			var c=get_max(arr[i]);
// 			if(c > ret) ret = c;
// 		}
// 		return ret;
// 	}
// 	return arr;
// }

function get_unit(max_val){
	var lg = Math.floor(Math.log10(max_val / 2));
	var unit = Math.pow(10, lg);
	if(max_val / unit < 5)	unit = unit / 2;
	if(max_val / unit > 10)	unit = unit * 2;
	return unit;
}

function print_unit(val){
	return Math.round((val + Number.EPSILON) * 100) / 100;
}

function ActivationSelector(parent, count=10, width=500, ww=500, wh=900){
	this.parent = parent; 
	this.ctx = parent.ctx; 

	this.hover = -1; 

	this.count = count ; 

	var unit = 1; 
	var text = unit * 3 ; 
	var total_units = (unit + text + unit) * count + unit ; 

	this.legend = Math.max(width / total_units, 9.15);
	this.margin = this.legend; 
	this.text_size = this.legend * text; 

	this.h = this.margin * 2 + this.legend;
	this.w = width;	 
	this.x = (ww - width) / 2 ; 
	this.y = wh - this.h - this.margin; 
}

ActivationSelector.prototype.draw = function(){
	this.ctx.beginPath();
	this.ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
	this.ctx.strokeStyle = 'black';
	this.ctx.rect(this.x, this.y, this.w, this.h);
	this.ctx.fill();
	this.ctx.stroke();

	this.ctx.strokeStyle='black'
	var cx = this.margin + this.x; 
	var cy = this.margin + this.y; 
	this.ctx.textAlign = 'left';
	this.ctx.fillStyle='black'
	var font_size = Math.floor(1.3 * this.margin) 
	var font_family = 'px BlinkMacSystemFont';

	if (navigator.userAgent.indexOf('Chrome') == -1) 	font_family = 'px sans-serif';

	this.ctx.beginPath()
	this.ctx.fillStyle = 'white';
	this.ctx.strokeStyle = 'white';
	var metrics = this.ctx.measureText('Audio Sample');
	var height_text = metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;
	this.ctx.rect(this.x+this.w/2-(this.ctx.measureText('Audio Sample').width/2)-2, this.y-height_text/2-2, this.ctx.measureText('Audio Sample').width+4, height_text+4);
	this.ctx.fill();
	this.ctx.fillStyle='black'
	this.ctx.fillText('Audio Sample', this.x+this.w/2-(this.ctx.measureText('Audio Sample').width/2), this.y)
	this.ctx.stroke();
	
	var width_text = this.ctx.measureText('10').width
	var width_selector = ((this.w-this.margin-this.margin-this.legend-width_text)/9)
	this.ctx.strokeStyle = 'black';

	for(var i=0;i<this.parent.is_active.length;i++){
		this.ctx.fillStyle = this.parent.colors[i];
		if (i!=this.hover){
			this.ctx.font= font_size + font_family;
			this.ctx.lineWidth = 1;
		}	else {
			this.ctx.font= (font_size+2) + font_family;
			this.ctx.lineWidth = 2;
		}
		if (this.parent.is_active[i] || i==this.hover)	this.ctx.globalAlpha = 1; 
		else 							this.ctx.globalAlpha = 0.1;

		this.ctx.beginPath();
		this.ctx.rect(cx, cy, this.legend, this.legend);
		this.ctx.fillText((i+1), cx + this.legend+5, cy + this.legend/2); 
		this.ctx.fill();
		this.ctx.stroke();
		cx += width_selector;
	}
	this.ctx.globalAlpha = 1;
}

ActivationSelector.prototype.get_box = function(x, y){
	var cx = this.margin + this.x; 
	var cy = this.margin + this.y; 
	var add = this.margin + this.legend + this.text_size;
	var width_selector = ((this.w-this.margin-this.margin-this.legend-this.ctx.measureText('10').width)/9)
	if(this.x <= x && x <= this.x + this.w  && this.y + this.margin <= y && y <= this.y + this.h - this.margin){
		for(var i=0;i<this.parent.is_active.length;i++){
			if (i!=9) var width_text = this.ctx.measureText('9').width
			else var width_text = this.ctx.measureText('10').width
			if(cx <= x && x <= cx + this.legend+2+width_text)	return i; 
			cx += width_selector ; 
		}
	}
	return -1; 
}

ActivationSelector.prototype.onmousemove = function(x, y){
	var font_size = Math.floor(1.3 * this.margin) 
	var font_family = 'px BlinkMacSystemFont';
	this.hover = this.get_box(x, y);
	if (this.hover ==-1) {
		document.body.style.cursor = 'default'
		//this.ctx.font= (font_size+2) + font_family;
		//this.ctx.lineWidth = 2;
	}
	else {
		document.body.style.cursor = 'pointer'
		//this.ctx.font= (font_size+2) + font_family;
		//this.ctx.lineWidth = 2;
	}
}

ActivationSelector.prototype.onclick = function(x, y){
	var index = this.get_box(x, y);
	if(index != -1){
		this.parent.is_active[index] = !this.parent.is_active[index];
	}
}

function FeatureActivationContentViewer(parent, data, x, y, w, h, f){
	this.ctx = parent.ctx; 
	this.parent = parent;
	this.data = data; 

	this.x = x; 
	this.y = y; 
	this.h = h; 
	this.w = w; 

	this.f = f; 
	this.selector = null; 


	this.margin = 40; 
	this.arrow = this.margin / 8 ;
	this.unit_anch = this.arrow * .66 ;
	this.compile_data(); 
}


FeatureActivationContentViewer.prototype.compile_data = function(){
	this.max_x_axis = this.data[0].length;
	this.max_y_axis = get_max(this.data);
	if(this.max_y_axis == 0)	this.max_y_axis = 0.01;
	this.unit_x = get_unit(this.max_x_axis);
	this.unit_y = get_unit(this.max_y_axis);
	this.round_x = Math.floor(.9 * this.max_x_axis / this.unit_x);
	this.round_y = Math.floor(.9 * this.max_y_axis / this.unit_y);
	this.anchor_x = print_unit(this.round_x * this.unit_x);
	this.anchor_y = print_unit(this.round_y * this.unit_y);
}

FeatureActivationContentViewer.prototype.draw = function(x, y, w, h){
	if(x - this.w <= this.x && this.x <= x + w + this.w && 
			y - this.h <= this.y && this.y <= y + h + this.h){
			this.ctx.fillStyle = 'white';
			// this.ctx.fillStyle = global_good_colors[this.f];
		this.ctx.beginPath();
		this.ctx.rect(this.x - x, this.y - y, this.w, this.h);
		this.ctx.fill();

		this.draw_axis(x, y);
		this.draw_activatons(x,y);
	}
}

FeatureActivationContentViewer.prototype.translate_x = function(x){
	return this.margin + ( x / this.max_x_axis ) * (this.w - 2*this.margin);
}

FeatureActivationContentViewer.prototype.translate_y = function(y){
	return this.h - this.margin - (y / this.max_y_axis) * (this.h - 2*this.margin);
}

FeatureActivationContentViewer.prototype.draw_axis = function(x, y){
	this.ctx.strokeStyle = 'black' ;
	this.ctx.lineWidth = 1;
	this.ctx.beginPath();
	this.ctx.moveTo(this.x - x + this.translate_x(0), this.y - y + this.translate_y(this.max_y_axis));
		this.ctx.lineTo(this.x - x + this.translate_x(0), this.y - y + this.translate_y(0));
		this.ctx.lineTo(this.x - x + this.translate_x(this.max_x_axis), this.y - y + this.translate_y(0));

		this.ctx.moveTo(this.x - x + this.translate_x(0) - this.arrow, this.y - y + this.translate_y(this.max_y_axis) + this.arrow);
		this.ctx.lineTo(this.x - x + this.translate_x(0) , this.y - y + this.translate_y(this.max_y_axis));
		this.ctx.lineTo(this.x - x + this.translate_x(0) + this.arrow, this.y - y + this.translate_y(this.max_y_axis) + this.arrow);

		this.ctx.moveTo(this.x - x + this.translate_x(this.max_x_axis) - this.arrow, this.y - y + this.translate_y(0) + this.arrow);
		this.ctx.lineTo(this.x - x + this.translate_x(this.max_x_axis), this.y - y + this.translate_y(0));
		this.ctx.lineTo(this.x - x + this.translate_x(this.max_x_axis) - this.arrow, this.y - y + this.translate_y(0) - this.arrow);

		for(var i=0;i<=this.max_x_axis;i+=this.unit_x){
			if (this.translate_x(i) >= this.translate_x(this.max_x_axis) - 2 * this.arrow)	continue;
			this.ctx.moveTo(this.x - x + this.translate_x(i), this.y - y + this.translate_y(0) - this.unit_anch);
			this.ctx.lineTo(this.x - x + this.translate_x(i), this.y - y + this.translate_y(0) + this.unit_anch);
		}

		for(var i=0;i<this.max_y_axis;i+=this.unit_y){
			if (this.translate_y(i) <= this.translate_y(this.max_y_axis) + 2 * this.arrow)	continue;
			this.ctx.moveTo(this.x - x + this.translate_x(0) - this.unit_anch, this.y - y + this.translate_y(i));
			this.ctx.lineTo(this.x - x + this.translate_x(0) + this.unit_anch, this.y - y + this.translate_y(i));	
		}
		this.ctx.stroke();
		if (navigator.userAgent.indexOf('Chrome') == -1) {
			this.ctx.font='14px sans-serif'
			}
		else {
		this.ctx.font='14px BlinkMacSystemFont'
		}
	this.ctx.fillStyle = 'black';
	this.ctx.textAlign = "center"; 
	this.ctx.textBaseline = "middle"; 
	var x0 = this.x - x + this.translate_x(0) - this.margin / 2; 
	var y0 = this.y - y + this.translate_y(0) + this.margin / 2;
	this.ctx.fillText(0, x0, this.y - y + this.translate_y(0));
	this.ctx.fillText(this.anchor_y, x0, this.y - y + this.translate_y(this.anchor_y));
	this.ctx.fillText(0, this.x - x + this.translate_x(0) ,  y0);
	this.ctx.fillText(this.anchor_x, this.x - x + this.translate_x(this.anchor_x) ,  y0);

	this.ctx.fillText('Feature ' + this.f, this.x - x + this.w /2  , this.y - y + this.margin) ;
	this.ctx.fillText('Time' , this.x - x + this.w/2, this.y - y + this.h - this.margin / 3) ;

	this.ctx.rotate(-Math.PI/2);
	this.ctx.fillText('Activation', -(this.y - y + this.h /2), (this.x - x + this.margin / 3)) ;
	this.ctx.rotate(+Math.PI/2);
}

FeatureActivationContentViewer.prototype.draw_activatons = function(x, y){
	this.ctx.lineWidth = 3;
	for(var i=0;i<this.data.length;i++) {
		if (this.parent.is_active[i]){
			this.ctx.strokeStyle = this.parent.colors[i];
			this.ctx.beginPath();
			this.ctx.moveTo(this.x - x + this.translate_x(0), this.y - y + this.translate_y(this.data[i][0]));
			for(var j=1;j<this.data[i].length;j++)	this.ctx.lineTo(this.x - x + this.translate_x(j), this.y - y + this.translate_y(this.data[i][j]));
			this.ctx.stroke();
		}
	}
	this.ctx.lineWidth = 1;
}


function ActivationContentViewer(scroll, scale){
	this.scroll = scroll;
	this.ctx = this.scroll.ctx ; 
	this.layer = -1;

	this.features = [] ; 

	this.height = scale * 400;
	this.feature_width = scale * 600; 
	this.margin = scale * 10 ; 

	// this.is_active = [] ;
	this.colors = [] ; 


	this.scroll.set_content(this); 

	this.activation_selector = null; 
	this.set_layer(5);
}

ActivationContentViewer.prototype.set_layer = function(layer_no){
	this.layer = layer_no;
	var self = this ; 
	ajax_get(base_js_url + 'acts/layer_' + this.layer +'.js', function(data) {	self.onload(data);	});
}

ActivationContentViewer.prototype.onload = function(data){
	this.features = [] ;
	this.colors = [];  

	if (this.is_active == undefined) {
		this.is_active = [];
		for (var i = 0; i < data[0].length; i++) {
			if (i < 2) this.is_active.push(true);
			else this.is_active.push(false);
		}
	}
	for(var i=0;i<data[0].length;i++)	this.colors.push(global_good_colors[i]);
	this.activation_selector = new ActivationSelector(this, this.colors.length, this.ctx.canvas.width * 0.6, this.ctx.canvas.width, this.ctx.canvas.height);

	var act_panel = this.activation_selector.h; 

	for(var i=0;i<data.length;i++){
		var cx = i * this.feature_width + (i+1) * this.margin ; 
		this.features.push(new FeatureActivationContentViewer(this, data[i], cx, this.margin, this.feature_width, this.height - 3*this.margin - act_panel, i));
	}

	this.scroll.set_content(this);
}

ActivationContentViewer.prototype.draw = function(x, y, w, h){
	for(var i=0;i<this.features.length;i++)	this.features[i].draw(x, y, w, h);
	this.activation_selector.draw();
}

ActivationContentViewer.prototype.get_width = function(){
	return this.features.length * (this.feature_width + this.margin) + this.margin;
}

ActivationContentViewer.prototype.get_height = function(){
	return this.height;
}

ActivationContentViewer.prototype.onmousemove = function(x, y){
	this.activation_selector.onmousemove(x - this.scroll.x, y - this.scroll.y);
}

ActivationContentViewer.prototype.onclick = function(x, y){
	this.activation_selector.onclick(x - this.scroll.x, y - this.scroll.y);
}

function ActivatoinLayers(id, scale){
	this.vs = new VirtualScroll(id);
	this.content = new ActivationContentViewer(this.vs, scale); 
}

function AutoScaleActivatoinLayers(id){
	this.vs = new VirtualScroll(id);
	var scale = this.vs.wheight  / 400 ; 
	this.content = new ActivationContentViewer(this.vs, scale); 
}

function TabbedActivation(scroll_id, tab_id, layers){
	this.activations = new AutoScaleActivatoinLayers(scroll_id); 

	this.div = document.getElementById(tab_id); 
	var content = "<div class='tab'> <div class='fixed'>Layer: </div> "; 
	for(var i=0;i<layers.length;i++)	content += "<div class='change' style='padding-right:2%; padding-left: 2%'><p class = 'layer' style='margin:0'>" + layers[i] + " </p></div>";
	content += '</div>';
	this.div.innerHTML = content; 

	this.layer_divs = this.div.getElementsByClassName('change');
	this.layers = layers; 

	var self = this; 
	function generator(i){ return function(){	
		self.clicked(i);
		for(var j=0;j<self.layer_divs.length;j++){
			var classes=self.layer_divs[j].classList;
			if(classes.contains('change2results')) classes.remove('change2results')
		}
		this.classList.add('change2results');
	};}
	for(var i=0;i<layers.length;i++)	this.layer_divs[i].onclick = generator(i);
	self.layer_divs[0].classList.add('change2results');
}

TabbedActivation.prototype.clicked = function(index){
	this.activations.content.set_layer(this.layers[index]);
}

TabbedActivation.prototype.draw = function(){
	this.activations.vs.draw();
}
