// var removed_features = [0, 3, 39, 45, 46]; //17, 24,30,
// var removed_people = [5, 2];
var order = [2, 1, 0, 3];


function CherryPicked(id, arr){
	this.parent = document.getElementById(id);
	this.arr = arr; 
	this.parent.innerHTML = this.html();

	this.content = this.parent.getElementsByClassName('cherry_picked_canvas')[0];
	this.tab_div = this.parent.getElementsByClassName('tab_div')[0];
	
	var layers = [];
	var features = [];
	var phonemes = [];
	for(var i=0;i<this.arr[0]['best'].length;i++){
		layers.push(this.arr[0]['best'][order[i]]['layer']);
		features.push(this.arr[0]['best'][order[i]]['feature']);
		phonemes.push(this.arr[0]['best'][order[i]]['phoneme']);
	}
	this.content_viewer = new AudioPlayerViewer(this.content, layers, features, phonemes);

	var words = [] ; 
	for(var i=0;i<arr.length;i++)	words.push(arr[i]['word']);
	this.tabs =  new TabSelector(this.tab_div, this, words, 'none');
}

CherryPicked.prototype.html = function(){
	return "<div class='tab_div'></div> <div class='cherry_picked_canvas'></div>";
}

CherryPicked.prototype.draw = function(){
	if(!isInViewport(this.parent))	return;
	this.content_viewer.wav_viewer.get_percent();
	if(!this.content_viewer.wav_viewer.need_render)	return; 
	this.content_viewer.draw();	
	this.content_viewer.wav_viewer.need_render = false; 
}

CherryPicked.prototype.select = function(i){
	var arr = this.arr[i];
	var audio_url = base_url + 'cherry/' + arr['index'] +'/audio.wav' ;
	this.content_viewer.set_content(arr['phoneme'], audio_url, arr['best'], arr['wav']);
}


function WaveViewer(parent, element, scale=1, color=global_good_colors[5]){
	this.element = element;
	this.parent = parent;
	this.audio = parent.audio;
	this.element.innerHTML = this.html();
	this.canvas = this.element.getElementsByClassName('phoneme_canvas')[0];

	this.ctx = this.canvas.getContext('2d');
	this.ctx.canvas.width = parent.w;
	this.ctx.canvas.height = parent.h;
	this.w = this.ctx.canvas.width+40;
	this.h = this.ctx.canvas.height;
	this.margin = scale * 10;
	this.dist = 2 * scale;

	this.content = null;
	this.default_color = color;

	this.draw();
	this.listeners();
}

WaveViewer.prototype.listeners = function(){
	this.is_dragging = false; 
	this.x = -100; 
	var self = this; 

	function f_down(event){
      	self.seek_mouse(self.get_mouse(event));

      	self.is_dragging=true;
      	self.audio.pause();
    }

    function f_up(event){
    	if(self.is_dragging)	self.audio.play();
      	self.is_dragging=false;
    }

    function f_out(event){
    	if(self.is_dragging)	self.audio.play();
      	self.is_dragging=false;
    }

    function f_move(event){
  		var old_x = self.x; 
		self.x = self.get_mouse(event);
		var deltaX = old_x - self.x; 
		if(self.is_dragging)	self.move(deltaX);
    }

	this.canvas.onmousedown = f_down;
    this.canvas.ontouchstart = f_down; 
    this.canvas.onmouseup = f_up; 
    this.canvas.ontouchend = f_up;
   	this.canvas.onmouseout = f_out; 
    this.canvas.ontouchout = f_out;
	this.canvas.onmousemove = f_move;
	this.canvas.ontouchmove = f_move;

	this.last_percent = -1; 
	this.need_render = true; 

	this.canvas.onclick = function(event){	self.seek_mouse(self.get_mouse(event));	}
}

WaveViewer.prototype.get_mouse = function(event){
	var rect = this.canvas.getBoundingClientRect();
	var ev = getTouch(event); 
	return ev.x - rect.left;
}

WaveViewer.prototype.seek_mouse = function(x){
	var p = (x - 3*1.5*this.margin) / (this.w - 3*3*this.margin) ;
	this.audio.currentTime = p * this.audio.duration;
	this.audio.play();
}

WaveViewer.prototype.move = function(deltaX){
	var p = deltaX / (this.w - 3*3*this.margin) ;
	this.audio.currentTime -= p * this.audio.duration;
}

WaveViewer.prototype.html = function(){
	var content = "<td style='padding:0; margin:0;'>";
	content += "<canvas class='phoneme_canvas'></canvas></td><td></td>"; 
	return content;
}

WaveViewer.prototype.set_content = function(phonemes){
	this.content = phonemes;
	this.analyze(); 
}

WaveViewer.prototype.analyze = function(){
	this.max_x = this.content.length-1;
	this.max_y = get_max(this.content);
}

WaveViewer.prototype.draw = function(){
	this.erase();
	if(this.need_loading())	this.loading();
	else {
		this.draw_waves(); 
		this.draw_curser(); 
	}
}

WaveViewer.prototype.need_loading = function(){
	if(this.content == null)	return true;
	return ! this.parent.audio_ready; 
}

WaveViewer.prototype.translate_x = function(x){	return 3*1.5*this.margin + ( x / this.max_x ) * (this.w - 3*3*this.margin);	}
WaveViewer.prototype.translate_y = function(y){	return this.h - this.margin - (y / this.max_y) * (this.h - 2 * this.margin); }

WaveViewer.prototype.draw_waves = function(){ 
	var percent = this.get_percent();
	for(var i=0;i<this.content.length;i++){
		this.ctx.beginPath();
		var color = (i < percent)? this.default_color: 'lightgray';
		this.ctx.strokeStyle = color;
		this.ctx.fillStyle = color;
		var x = this.translate_x(i);
		var y1 = this.translate_y(this.max_y/3) ;
		var y2 = this.translate_y(2*this.content[i]/3 + this.max_y/3);
		this.ctx.fillRect(x-this.dist, y1, 2*this.dist, y2-y1)

		var y3 = this.translate_y(this.max_y/3) + this.dist;
		var y4 = this.translate_y(this.max_y/3-this.content[i]/3) + this.dist;
		this.ctx.moveTo(this.translate_x(i), y3);
		this.ctx.lineTo(this.translate_x(i), y4);
		this.ctx.stroke();
	}
	
}

WaveViewer.prototype.get_percent = function(){
	var cur = 0; 
	if(!Number.isNaN(this.audio.duration))	cur = this.max_x * this.audio.currentTime / this.audio.duration;
	if(this.last_percent != cur){
		this.last_percent = cur ; 
		this.need_render = true; 
	}
	return cur;
}

WaveViewer.prototype.draw_curser = function(){
	var percent = this.get_percent();
	this.ctx.strokeStyle = 'red';
	this.ctx.beginPath();
	this.ctx.moveTo(this.translate_x(percent), 0);
	this.ctx.lineTo(this.translate_x(percent), this.h);
	this.ctx.stroke();
}

WaveViewer.prototype.erase = function(){
	this.ctx.fillStyle = 'white';
	this.ctx.fillRect(0, 0, this.w, this.h);
}

WaveViewer.prototype.loading = function(){
	this.ctx.fillStyle = 'black';
	this.ctx.textAlign = "center"; 
	this.ctx.textBaseline = "middle"; 
	this.ctx.font = '16px arial';
	this.ctx.fillText('Loading... Please Wait...', this.w/2, this.h/2);
}

function ActivationPlayerViewer(parent, element, layer, feature, phoneme, color, scale=1){
	this.audio = parent.audio; 
	this.parent = parent;

	this.element = element;
	this.layer = layer; 
	this.color = color;
	this.feature = feature; 
	this.phoneme = phoneme;
	this.element.innerHTML = this.html();

	this.canvas = this.element.getElementsByClassName('activation_canvas')[0];

	this.ctx = this.canvas.getContext('2d');
	this.ctx.canvas.width = parent.w;
	this.ctx.canvas.height = parent.h;
	this.w = this.ctx.canvas.width+40;
	this.h = this.ctx.canvas.height;
	this.margin = scale * 30;
	this.unit = scale * 4; 
	this.arrow = 1.5 * this.unit; 

	this.content = null;

	this.draw();
}

ActivationPlayerViewer.prototype.html = function(){
	width_temp = this.parent.parent.offsetWidth-this.parent.w;
	var content = "<td style='padding:0; margin:0;'><canvas class='activation_canvas'></canvas></td>";
	content += "<td style='width:" + width_temp+ "px;text-align:center;'><figcaption class = 'leg' style = 'white-space: nowrap; font-size: min(2.5vw, 12px)'>Layer: ";
	content += this.layer + "<br>Feature: " + this.feature + "<br>Phoneme: " + this.phoneme + "</figcaption>";
	content += "</td>"; 
	return content;
}


ActivationPlayerViewer.prototype.set_content = function(activations){
	this.content = activations;
	this.analyze(); 
}

ActivationPlayerViewer.prototype.analyze = function(){
	this.max_x = this.content.length-1;
	this.max_y = get_max(this.content);
	if(this.max_y == 0)	this.max_y = 0.01;
	this.unit_x = get_unit(this.max_x);
	this.unit_y = get_unit(this.max_y);
}

ActivationPlayerViewer.prototype.draw = function(){
	this.erase();
	if(this.need_loading())	this.loading();
	else {
		this.draw_activations(); 
		this.draw_axis(); 
		this.draw_curser(); 
	}
}

ActivationPlayerViewer.prototype.need_loading = function(){
	if(this.content == null)	return true;
	return ! this.parent.audio_ready; 
}

ActivationPlayerViewer.prototype.translate_x = function(x){	return 1.5 * this.margin + ( x / this.max_x ) * (this.w - 3*this.margin);	}
ActivationPlayerViewer.prototype.translate_y = function(y){	return this.h - this.margin - (y / this.max_y) * (this.h - 1.1 * this.margin); }

ActivationPlayerViewer.prototype.draw_axis = function(){
	this.ctx.strokeStyle = 'black' ;
	this.ctx.beginPath();
	this.ctx.moveTo(this.translate_x(0), this.translate_y(this.max_y));
	this.ctx.lineTo(this.translate_x(0), this.translate_y(0));
	this.ctx.lineTo(this.translate_x(this.max_x), this.translate_y(0));

	this.ctx.moveTo(this.translate_x(this.max_x) - this.arrow, this.translate_y(0) - this.arrow);
	this.ctx.lineTo(this.translate_x(this.max_x), this.translate_y(0)); 
	this.ctx.lineTo(this.translate_x(this.max_x) - this.arrow, this.translate_y(0) + this.arrow);

	this.ctx.moveTo(this.translate_x(0) - this.arrow, this.translate_y(this.max_y) + this.arrow); 
	this.ctx.lineTo(this.translate_x(0) , this.translate_y(this.max_y) ); 
	this.ctx.lineTo(this.translate_x(0) + this.arrow, this.translate_y(this.max_y) + this.arrow); 

	for(var i=0;i<this.max_x;i+= this.unit_x){
		this.ctx.moveTo(this.translate_x(i), this.translate_y(0) - this.unit);
		this.ctx.lineTo(this.translate_x(i), this.translate_y(0) + this.unit);
	}

	for(var i=0;i + this.unit_y/2<this.max_y;i+= 2*this.unit_y){
		this.ctx.moveTo(this.translate_x(0) - this.unit, this.translate_y(i));
		this.ctx.lineTo(this.translate_x(0) + this.unit, this.translate_y(i));
	}

	this.ctx.stroke();

	this.ctx.fillStyle = 'black';
	this.ctx.textAlign = "center"; 
	this.ctx.textBaseline = "middle"; 
	this.ctx.font = '60% sans-serif';
	for(var i=0;i<this.max_x;i+= this.unit_x)	
		this.ctx.fillText(print_unit(i), this.translate_x(i), this.translate_y(0) + this.margin/3);
	for(var i=0;i + this.unit_y/2<this.max_y;i+= 2*this.unit_y)	
		this.ctx.fillText(print_unit(i), this.translate_x(0) - this.margin / 2, this.translate_y(i));
	this.ctx.font = '80% sans-serif';
	this.ctx.fillText('Time', this.translate_x(this.max_x/2), this.translate_y(0) + this.margin/2+5);
	this.ctx.rotate(-Math.PI/2);
	this.ctx.fillText('Activation', -((this.translate_y(0)+this.translate_y(this.max_y)) /2)-5, (this.margin / 2)) ;
	this.ctx.rotate(+Math.PI/2);
}

ActivationPlayerViewer.prototype.draw_activations = function(){ 
	this.ctx.beginPath();
	this.ctx.moveTo(this.translate_x(0), this.translate_y(0));
	for(var i=0;i<this.content.length;i++)
		this.ctx.lineTo(this.translate_x(i), this.translate_y(this.content[i]));
	this.ctx.lineTo(this.translate_x(this.content.length-1), this.translate_y(0));
	this.ctx.moveTo(this.translate_x(0), this.translate_y(0));
	this.ctx.strokeStyle = "black";
	this.ctx.fillStyle = this.color;
	this.ctx.fill();

	this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
	var x1 = this.translate_x(this.get_percent());
	var x2 = this.translate_x(this.max_x);
	var y1 = this.translate_y(this.max_y);
	var y2 = this.translate_y(0);
	this.ctx.fillRect(x1, y1, x2-x1, y2-y1);
	this.ctx.stroke();
}

ActivationPlayerViewer.prototype.get_percent = function(){
	if(!Number.isNaN(this.audio.duration))	return this.max_x * this.audio.currentTime / this.audio.duration;
	return 0;
}

ActivationPlayerViewer.prototype.draw_curser = function(){
	var percent = this.get_percent();
	this.ctx.strokeStyle = 'red';
	this.ctx.beginPath();
	this.ctx.moveTo(this.translate_x(percent), 0);
	this.ctx.lineTo(this.translate_x(percent), this.h);
	this.ctx.stroke();
}

ActivationPlayerViewer.prototype.erase = function(){
	this.ctx.fillStyle = 'white';
	this.ctx.fillRect(0, 0, this.w, this.h);
}

ActivationPlayerViewer.prototype.loading = function(){
	this.ctx.fillStyle = 'black';
	this.ctx.textAlign = "center"; 
	this.ctx.textBaseline = "middle"; 
	this.ctx.font = '16px sans-serif';
	this.ctx.fillText('Loading... Please Wait...', this.w/2, this.h/2);
}

function PhonemeViewer(parent, element, scale=1){
	this.parent = parent;
	this.element = element;
	this.audio = parent.audio;
	this.element.innerHTML = this.html();
	this.canvas = this.element.getElementsByClassName('phoneme_canvas')[0];

	this.ctx = this.canvas.getContext('2d');
	this.ctx.canvas.width = parent.w;
	this.ctx.canvas.height = parent.h;
	this.w = this.ctx.canvas.width+40;
	this.h = this.ctx.canvas.height;

	this.margin = scale * 30;
	this.unit = scale * 4; 

	this.content = null;

	this.draw();
}

PhonemeViewer.prototype.html = function(){
	var content = "<td style='padding:0; margin:0;'>";
	content += "<canvas class='phoneme_canvas'></canvas></td><td></td>"; 
	return content;
}

PhonemeViewer.prototype.set_content = function(phonemes){
	this.content = phonemes;
	this.analyze(); 
}

PhonemeViewer.prototype.analyze = function(){
	this.max_x = this.content[this.content.length-1][1]; 
	this.unit_x = get_unit(this.max_x);
}

PhonemeViewer.prototype.draw = function(){
	this.erase();
	if(this.need_loading())	this.loading();
	else {
		this.draw_phonemes(); 
		this.draw_axis(); 
		this.draw_curser(); 
	}
}

PhonemeViewer.prototype.need_loading = function(){
	if(this.content == null)	return true;
	return ! this.parent.audio_ready; 
}

PhonemeViewer.prototype.translate_x = function(x){	return 1.5*this.margin + ( x / this.max_x ) * (this.w - 3*this.margin);	}
PhonemeViewer.prototype.translate_y = function(y){	return  y * (this.h - 1 * this.margin); }

PhonemeViewer.prototype.draw_axis = function(){
	this.ctx.strokeStyle = 'black' ;
	this.ctx.beginPath();
	this.ctx.moveTo(this.translate_x(0), this.translate_y(1));
	this.ctx.lineTo(this.translate_x(this.max_x), this.translate_y(1));

	this.ctx.moveTo(this.translate_x(this.max_x), this.translate_y(1) - this.unit);
	this.ctx.lineTo(this.translate_x(this.max_x), this.translate_y(1) + this.unit);

	for(var i=0;i<this.max_x;i+= this.unit_x){
		this.ctx.moveTo(this.translate_x(i), this.translate_y(1) - this.unit);
		this.ctx.lineTo(this.translate_x(i), this.translate_y(1) + this.unit);
	}


	this.ctx.stroke();

	this.ctx.fillStyle = 'black';
	this.ctx.textAlign = "center"; 
	this.ctx.textBaseline = "middle"; 
	this.ctx.font = '60% sans-serif';
	for(var i=0;i<this.max_x;i+= this.unit_x)	this.ctx.fillText(i, this.translate_x(i), this.translate_y(1) + this.margin/3);
	this.ctx.font = '80% sans-serif';
	this.ctx.fillText('Time', this.translate_x(this.max_x/2), this.translate_y(1) + this.margin/2+5);
}

PhonemeViewer.prototype.draw_phonemes = function(){ 
	this.ctx.textAlign = "center"; 
	this.ctx.textBaseline = "middle"; 
	this.ctx.font = '75% sans-serif';
	var percent = this.translate_x(this.get_percent());

	var y1 = this.translate_y(0);
	var y2 = this.translate_y(1);

	for(var i=0;i<this.content.length;i++){
		var x1 = this.translate_x(this.content[i][0]);
		var x2 = this.translate_x(this.content[i][1]);
		var drawn = false;
		if(1-i&1){
			if(x2 < percent)	this.ctx.fillStyle = global_good_colors[6];
			else if(x1 < percent) {
				this.ctx.fillStyle = global_good_colors[6];
				this.ctx.fillRect(x1, y1, percent-x1, y2-y1);
				this.ctx.fillStyle = 'lightgray'; 
				this.ctx.fillRect(percent, y1, x2-percent, y2-y1);
				drawn = true;
			} else this.ctx.fillStyle = 'lightgray'; 
		} else this.ctx.fillStyle = 'white'; 
		
		if(!drawn)	this.ctx.fillRect(x1, y1, x2-x1, y2-y1);

		this.ctx.fillStyle = 'black';
		this.ctx.fillText(this.content[i][2], (x1+x2)/2, (y1+y2)/2);
	}
}

PhonemeViewer.prototype.get_percent = function(){
	if(!Number.isNaN(this.audio.duration))	return this.max_x * this.audio.currentTime / this.audio.duration;
	return 0;
}

PhonemeViewer.prototype.draw_curser = function(){
	var percent = this.get_percent();
	this.ctx.strokeStyle = 'red';
	this.ctx.beginPath();
	this.ctx.moveTo(this.translate_x(percent), 0);
	this.ctx.lineTo(this.translate_x(percent), this.h);
	this.ctx.stroke();
}

PhonemeViewer.prototype.erase = function(){
	this.ctx.fillStyle = 'white';
	this.ctx.fillRect(0, 0, this.w, this.h);
}

PhonemeViewer.prototype.loading = function(){
	this.ctx.fillStyle = 'black';
	this.ctx.textAlign = "center"; 
	this.ctx.textBaseline = "middle"; 
	this.ctx.font = '16px arial';
	this.ctx.fillText('Loading... Please Wait...', this.w/2, this.h/2);
}

function AudioPlayerViewer(parent, layers, features, phonemes){
	this.parent = parent;
	this.layers = layers;
	this.features = features; 
	this.phonemes = phonemes;

	this.parent.innerHTML = this.html(this.layers.length); 
	this.w = Math.floor(this.parent.offsetWidth * 0.9)-40;
	this.h = Math.max(Math.floor(window.innerHeight / 8), 80);
	// this.audio = Audio();
	this.audio = this.parent.getElementsByClassName('audio_player')[0];
	this.audio_src = this.audio.getElementsByClassName('audio_src')[0];

	var self = this; 
	this.audio_ready = false; 
	this.audio.onloadeddata = function(){
		self.audio_ready = true;
		self.wav_viewer.need_render = true;
	}

	var activation_viewer = this.parent.getElementsByClassName('audio_activation_div');
	this.activatoin_players = [] ; 
	for(var i=0;i<this.layers.length;i++)	
		this.activatoin_players.push(new ActivationPlayerViewer(this, activation_viewer[i], layers[i], features[i], phonemes[i], global_good_colors[i]));
	this.wav_viewer = new WaveViewer(this, this.parent.getElementsByClassName('audio_wav_div')[0]);
	this.phoneme_viewer = new PhonemeViewer(this, this.parent.getElementsByClassName('audio_phoneme_div')[0]);
	this.vcart = true; 

	// this.animation_id = -1; 
	// this.animate();
}

AudioPlayerViewer.prototype.html = function(count){
	var content = "";
	content += "<table class='l-page' style='border-collapse: collapse;'>";
	for(var i=0;i<count;i++) content+="<tr class='audio_activation_div'></tr>";
	content += "<tr class='audio_phoneme_div'></tr>";
	content += "<tr class='audio_wav_div'></tr>";
	content += "<tr> <td>"; 
	content += "<audio controls autoplay class='audio_player' style='display:none;'>'<source class='audio_src' src='' type='audio/wav'> Your browser does not support this audio'; </audio> " ;
	// content += '<audio controls autoplay id="audio_id"> <source id="audio_src" src=""> </audio>'
	content += "</td><td></td> </tr>"; //style='display:none;'
	content += "</table>";
	return content;
}

// AudioPlayerViewer.prototype.animate = function(){
// 	this.animation_id = window.requestAnimationFrame(this.animate.bind(this));
// 	this.draw();
// }

AudioPlayerViewer.prototype.draw = function(){
	this.phoneme_viewer.draw();
	for(var i=0;i<this.activatoin_players.length;i++)	this.activatoin_players[i].draw();
	this.wav_viewer.draw();
}

AudioPlayerViewer.prototype.set_content = function(phonemes, audio_url, activations, wav){
	this.phoneme_viewer.set_content(phonemes);
	this.wav_viewer.set_content(wav);
	for(var i=0;i<this.activatoin_players.length;i++)	this.activatoin_players[i].set_content(activations[order[i]]['graph']);

	this.audio_ready = false;
	this.audio.src =  audio_url;
	this.audio.playbackRate = .5;
	if(!this.vcart)	this.audio.play();
	this.vcart = false ;

}