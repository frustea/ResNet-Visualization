function gender_plot_prepare_data(){
  var cur_data = [];
  var goodies = [97, 8, 17, 64, 68, 63, 79]; 
  for(var i=0;i<goodies.length;i++) cur_data.push(gender_plot_data[goodies[i]]);
  for(var i=0;i<cur_data.length;i++){
    // cur_data[i]['waves'][1]['url'] = 'https://storage.googleapis.com/audiozation/audios/gender/'+ cur_data[i]['index'] + '_male.mp3';
    // cur_data[i]['waves'][0]['url'] = 'https://storage.googleapis.com/audiozation/audios/gender/'+ cur_data[i]['index'] + '_female.mp3';
  }
  return cur_data;
}

function GenderGraph(id, data, scale=1){
	this.element = document.getElementById(id);
	this.data = data; 

	this.element.innerHTML = this.html();

	this.canvas = this.element.getElementsByClassName('canvas_div')[0];
	this.ctx = this.canvas.getContext("2d");
	this.w = Math.floor(this.element.clientWidth);


	var sample_layer = this.data[0]['network'];
	this.n_layers = sample_layer.length;
	this.n_features = 0;
	for(var i in sample_layer[0])	this.n_features += sample_layer[0][i];

	this.margin = Math.floor(this.w/400) * scale;
	var xr = (this.w - (this.n_layers * 3 + 1) * this.margin) / this.n_layers;
	this.r =  xr / 2;
	this.w = (this.n_layers * 3 + 1) * this.margin + this.n_layers * 2 * this.r; 
	this.h = (this.n_features + 3) * this.margin + this.n_features * 2 * this.r;
	this.ctx.canvas.width = this.w; 
	this.ctx.canvas.height = this.h;

	var t_colors = ['white', 'blue', 'red', 'purple'];
	this.colors = [];
	for(var i=0;i<4;i++){
		var add_colors = [] ; 
		for(var j=0;j<4;j++)	add_colors.push(t_colors[i&j]);
		this.colors.push(add_colors); 
	}

	this.player = new GenderPlayer(this, this.element.getElementsByClassName('gender_player')[0], scale);

	var words = [];
	for(var i=0;i<data.length;i++)	words.push(data[i]['word']);
	var tabs_div = this.element.getElementsByClassName('tabs_div')[0];
	this.tabs = new TabSelector(tabs_div, this, words, 'none');
}

GenderGraph.prototype.select = function(i){
	this.selected = i; 
	this.player.set_sources(this.data[i]['waves']);
}

GenderGraph.prototype.set_mode = function(mode){
	this.mode = mode;
}

GenderGraph.prototype.html = function(){
	var context = "";
	context += "<div class='tabs_div'></div>"; 
	context += "<canvas class='canvas_div'></canvas>";

	context += "<div class='gender_player'></div>";
	return context;
}


GenderGraph.prototype.erase = function(){
	this.ctx.fillStyle = 'white'; 
	this.ctx.fillRect(0, 0, this.w, this.h);
}

GenderGraph.prototype.loading = function(){
	this.ctx.fillStyle = 'black';
	this.ctx.textAlign = "center"; 
	this.ctx.textBaseline = "middle"; 
	this.ctx.font = '16px arial';
	this.ctx.fillText('Loading... Please Wait...', this.w/2, this.h/2);
}

GenderGraph.prototype.needs_loading = function(){
	return false; 
}

GenderGraph.prototype.draw = function(){
	if(this.needs_loading())	this.loading();
	else {
		var p = this.player.get_percent();
		if(this.player.has_changed)	{
			this.erase();
			this.draw_layers(p);
		}
		this.player.draw();
	}
}

GenderGraph.prototype.draw_layers = function(percent){
	var w = 2 * (this.r + this.margin) ; 
	var h = this.h - 2 * this.margin; 
	var x_step = w + this.margin;
	this.ctx.fillStyle = 'lightgray'; 
	this.ctx.strokeStyle = 'gray';
	for(var i=0;i<this.n_layers;i++)	this.draw_layer(this.margin + i * x_step, this.margin, w, h);

	var y_step = this.r * 2 + this.margin; 
	var data = this.data[this.selected]['network']; 
	for(var l=0;l<this.n_layers;l++){
		var cx = l * x_step + this.margin + w/2;
		var cy = this.margin * 2 + this.r ;
		var colors = this.colors[this.mode];

		if (l/this.n_layers < percent){
			cy = this.draw_features(cx, cy, Math.floor(data[l][0]/2), colors[0], y_step);
			cy = this.draw_features(cx, cy, data[l][1], colors[1], y_step);
			cy = this.draw_features(cx, cy, data[l][3], colors[3], y_step);
			cy = this.draw_features(cx, cy, data[l][2], colors[2], y_step);
			cy = this.draw_features(cx, cy, data[l][0] - Math.floor(data[l][0]/2), colors[0], y_step);
		} else {
			cy = this.draw_features(cx, cy, this.n_features, colors[0], y_step);
		}
	}
}

GenderGraph.prototype.draw_layer = function(x, y, w, h){
	var r = w/2; 
	this.ctx.beginPath();
	this.ctx.arc(x + r, y+r, r, Math.PI, 0, false);
	this.ctx.arc(x + r, y+h-r, r, 0, Math.PI, false);
	this.ctx.fill();
}

GenderGraph.prototype.draw_features = function(x, y, count, color, step){
	this.ctx.beginPath();
	this.ctx.fillStyle = color;
	for(var j=0;j<count;j++){
		this.ctx.arc(x, y, this.r, 0, 2*Math.PI, false);
		y += step ; 
	}
	this.ctx.fill();
	return y;
}

function GenderPlayer(parent, element, scale=1){
	this.element = element;
	this.parent = parent; 

	this.w = this.parent.w;
	this.h = this.parent.h/4;

	this.element.innerHTML = this.html();

	var players = element.getElementsByClassName('gender_player_wrapper');
	this.viewers = [new GenderPlayerWrapper(this, players[0], scale, 'blue'), new GenderPlayerWrapper(this, players[1], scale, 'red')];
	var down_tabs = element.getElementsByClassName('gender_buttons')[0]; 
	this.buttons = new DownTabSelector(down_tabs, this, ['Play Female', 'Play Both', 'Play Male']);
	this.buttons.tabs[0].classList.add('genderfemale');
	this.buttons.tabs[1].classList.add('genderboth');
	this.buttons.tabs[2].classList.add('gendermale');
	this.mode = 1 ; 

	this.has_changed = true; 
	this.last_value = -1; 
}

GenderPlayer.prototype.select = function(selected){
	selected = {0:1, 1:3, 2:2}[selected];
	this.mode = selected;
	this.parent.set_mode(this.mode);
	for(var i=0;i<2;i++)	this.viewers[i].stop();
	for(var i=0;i<2;i++)	if(((i+1) & selected) != 0)	this.viewers[i].play();
}

GenderPlayer.prototype.html = function(){
	var content = "" ; 
	content += "<div class='gender_player_wrapper'></div>";
	content += "<div class='gender_player_wrapper'></div>";
	content += "<div class='gender_buttons'></div>";
	return content; 
}

GenderPlayer.prototype.set_sources = function(sources){
	for(var i=0;i<2;i++)	this.viewers[i].set_content(sources[1-i]);
}

GenderPlayer.prototype.draw = function(){
	for(var i=0;i<2;i++)	this.viewers[i].draw();
}

GenderPlayer.prototype.get_percent = function(){
	var cur_val = this.viewers[(this.mode-1)&1].get_percent();
	this.has_changed = (cur_val != this.last_value);
	this.last_value = cur_val;
	return cur_val;
}


function GenderPlayerWrapper(parent, element, scale=1, color='red'){
	this.element = element;
	this.parent = parent; 

	this.w = this.parent.w;
	this.h = this.parent.h;

	this.element.innerHTML = this.html();
	this.audio = this.element.getElementsByClassName('audio_player')[0]; 
	var self = this; 
	this.audio_ready = false; 
	this.audio.onloadeddata = function(){	self.audio_ready = true; 	}

	this.player = new GenderWave(this, this.element.getElementsByClassName('audio_wav_div')[0], scale, color);
}

GenderPlayerWrapper.prototype.stop = function(){
	if(!Number.isNaN(this.audio.duration)){
		this.audio.currentTime = 0;
		if (!this.audio.paused)	this.audio.pause();
	}
}

GenderPlayerWrapper.prototype.play = function(){
	if(!Number.isNaN(this.audio.duration))	this.audio.play();
}

GenderPlayerWrapper.prototype.draw = function(){
	this.player.draw();
}

GenderPlayerWrapper.prototype.set_content = function(content){
	this.audio.src = content['url'];
	this.player.set_content(content['wav']);
}

GenderPlayerWrapper.prototype.html = function(){
	var content = "" ; 
	content += "<div class='audio_wav_div'></div>";
	content += "<audio controls class='audio_player' style='display:none'>'<source src='' type='audio/wav'> Your browser does not support this audio'; </audio> " ;
	return content; 
}

GenderPlayerWrapper.prototype.get_percent = function(){
	if(!Number.isNaN(this.audio.duration))	return this.audio.currentTime / this.audio.duration;
	return 0;
}

function GenderWave(parent, element, scale=1, color=global_good_colors[5]){
	WaveViewer.call(this, parent, element, scale, color);
	this.margin = parent.parent.parent.margin;
}

GenderWave.prototype = Object.create(WaveViewer.prototype);
Object.defineProperty(GenderWave.prototype, 'constructor', {value: GenderWave,	enumerable: false, writable: true });


GenderWave.prototype.html = function(){
	var content = "";
	content += "<canvas class='phoneme_canvas'></canvas>"; 
	return content;
}

GenderWave.prototype.seek_mouse = function(x){}
GenderWave.prototype.move = function(deltaX){}
GenderWave.prototype.listeners = function(){}


