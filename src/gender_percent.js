function GenderPercent(id, data, name, color=global_good_colors[0], y_ax){
  this.element = document.getElementById(id);
  this.data = data; 

  this.element.innerHTML = this.html();

  this.canvas = this.element.getElementsByClassName('canvas_div')[0];
  this.ctx = this.canvas.getContext("2d");
  this.w = Math.floor(this.element.clientWidth);
  this.h = Math.max(Math.floor(this.w * 1.5 / 4), 328)

  // this.data = [0].concat(data); 
  this.data = data; 

  this.name = name; 
  this.color = color ; 
  this.y_ax = y_ax;

  this.margin = Math.floor(this.w/20); 
  this.arrow = this.margin / 8 ;
  this.unit_anch = this.arrow * .66 ;
  this.compile_data(); 
  this.ctx.canvas.width = this.w; 
  this.ctx.canvas.height = this.h;
}

GenderPercent.prototype.compile_data = function(){
  this.max_x_axis = this.data.length;
  this.max_y_axis = get_max(this.data);
  this.unit_x = get_unit(this.max_x_axis);
  this.unit_y = get_unit(this.max_y_axis);
  this.round_x = Math.floor(.9 * this.max_x_axis / this.unit_x);
  this.round_y = Math.floor(.9 * this.max_y_axis / this.unit_y);
  this.anchor_x = print_unit(this.round_x * this.unit_x);
  this.anchor_y = print_unit(this.round_y * this.unit_y);
}

GenderPercent.prototype.html = function(){
  var content = "";
  content += "<canvas class='canvas_div'></canvas>";
  // context += "<audio controls class='audio_player' style='display:none'>'<source src='' type='audio/wav'> Your browser does not support this audio'; </audio> " ;
  return content;
}

GenderPercent.prototype.erase = function(){
  this.ctx.fillStyle = 'white'; 
  this.ctx.fillRect(0, 0, this.w, this.h);
}

GenderPercent.prototype.draw = function(){
  if(!isInViewport(this.element))  return;
  this.erase();

 
  this.draw_axis(); 
  this.draw_activatons(this.data, this.color);
}

GenderPercent.prototype.translate_x = function(x){
  return this.margin + ( x / this.max_x_axis ) * (this.w - 2*this.margin);
}

GenderPercent.prototype.translate_y = function(y){
  return this.h - this.margin - (y / this.max_y_axis) * (this.h - 2*this.margin);
}

GenderPercent.prototype.draw_axis = function(){
  this.ctx.strokeStyle = 'black' ;
  this.ctx.beginPath();
  this.ctx.moveTo(this.translate_x(0), this.translate_y(this.max_y_axis));
  this.ctx.lineTo(this.translate_x(0), this.translate_y(0));
  this.ctx.lineTo(this.translate_x(this.max_x_axis), this.translate_y(0));

  this.ctx.moveTo(this.translate_x(0) - this.arrow, this.translate_y(this.max_y_axis) + this.arrow);
  this.ctx.lineTo(this.translate_x(0) , this.translate_y(this.max_y_axis));
  this.ctx.lineTo(this.translate_x(0) + this.arrow, this.translate_y(this.max_y_axis) + this.arrow);

  this.ctx.moveTo(this.translate_x(this.max_x_axis) - this.arrow, this.translate_y(0) + this.arrow);
  this.ctx.lineTo(this.translate_x(this.max_x_axis), this.translate_y(0));
  this.ctx.lineTo(this.translate_x(this.max_x_axis) - this.arrow, this.translate_y(0) - this.arrow);

  for(var i=0;i<=this.max_x_axis;i+=this.unit_x){
    if (this.translate_x(i) >= this.translate_x(this.max_x_axis) - 2 * this.arrow)  continue;
    this.ctx.moveTo(this.translate_x(i), this.translate_y(0) - this.unit_anch);
    this.ctx.lineTo(this.translate_x(i), this.translate_y(0) + this.unit_anch);
  }

  for(var i=0;i<this.max_y_axis;i+=this.unit_y){
    if (this.translate_y(i) <= this.translate_y(this.max_y_axis) + 2 * this.arrow)  continue;
    this.ctx.moveTo(this.translate_x(0) - this.unit_anch, this.translate_y(i));
    this.ctx.lineTo(this.translate_x(0) + this.unit_anch, this.translate_y(i)); 
  }
  this.ctx.stroke();

  this.ctx.fillStyle = 'black';
  this.ctx.textAlign = "center"; 
  this.ctx.textBaseline = "middle"; 
  var x0 = this.translate_x(0) - this.margin / 3; 
  var y0 = this.translate_y(0) + this.margin / 3;
  
  if (this.ctx.measureText(this.anchor_y).width > this.margin) {
    this.ctx.textAlign = "center"; 
    this.ctx.font = '55% sans-serif';
    this.ctx.fillText(0, x0, this.translate_y(0));
    this.ctx.fillText(0, this.translate_x(0) ,  y0);
    this.ctx.fillText(this.anchor_y, x0, this.translate_y(this.anchor_y));
    this.ctx.fillText(this.anchor_x, this.translate_x(this.anchor_x) ,  y0);
    this.ctx.textAlign = "center"; 
    this.ctx.font = '70% sans-serif';
    this.ctx.fillText(this.name, this.w /2  , this.margin-12) ;
    this.ctx.fillText('Layer' , this.w/2, this.h - this.margin / 3) ;
    this.ctx.rotate(-Math.PI/2);
    this.ctx.fillText(this.y_ax, -(this.h /2), (this.margin / 3)) ;
    this.ctx.rotate(+Math.PI/2);
  }
  else {
    this.ctx.textAlign = "center"; 
    this.ctx.fillText(this.name, this.w /2  , this.margin-12) ;
    this.ctx.fillText('Layer' , this.w/2, this.h - this.margin / 3) ;
    this.ctx.rotate(-Math.PI/2);
    this.ctx.fillText(this.y_ax, -(this.h /2), (this.margin / 3)) ;
    this.ctx.rotate(+Math.PI/2);
    this.ctx.fillText(0, x0, this.translate_y(0));
    this.ctx.fillText(0, this.translate_x(0) ,  y0);
    this.ctx.fillText(this.anchor_y, x0, this.translate_y(this.anchor_y));
    this.ctx.fillText(this.anchor_x, this.translate_x(this.anchor_x) ,  y0);
  }
  
}

GenderPercent.prototype.draw_activatons = function(data, color){
  this.ctx.lineWidth = 3;
  // this.ctx.strokeStyle = this.color;
  this.ctx.strokeStyle = color; 
  // this.ctx.fillStyle = this.color;
  this.ctx.fillStyle = color; 
  this.ctx.beginPath();
  // this.ctx.moveTo(this.translate_x(0), this.translate_y(this.data[0]));
  this.ctx.moveTo(this.translate_x(0), this.translate_y(data[0]));
  for(var j=0;j<data.length;j++) this.ctx.lineTo(this.translate_x(j), this.translate_y(data[j]));
  this.ctx.stroke();
  this.ctx.lineWidth = 1;


  for(var j=0;j<data.length;j++) {
    this.ctx.beginPath();
    this.ctx.arc(this.translate_x(j), this.translate_y(data[j]), this.arrow, 0, 2 * Math.PI);
    this.ctx.fill();
  }
}

function LengthChart(id, data, name, colors, y_ax, audio_url='length'){
  GenderPercent.call(this, id, data, name, colors, y_ax);
  this.audio_player = this.element.getElementsByClassName('audio_player')[0];
  this.set_listeners();
  this.need_render = true;
  this.url = audio_url;

  this.key_arr = ['min', 'avg', 'max'];
  this.labels = ['Min', 'Mean', 'Max']
  this.selector = new LengthSelector(this, colors, this.labels,  200, this.w, this.h, this.margin);
  this.selected = 2; 
}

LengthChart.prototype = Object.create(GenderPercent.prototype);
Object.defineProperty(LengthChart.prototype, 'constructor', {value: GenderPercent,  enumerable: false, writable: true });


LengthChart.prototype.set_listeners = function(){
  this.is_dragging = false; 
  this.mouse_x = -1;
  this.mouse_y = -1;
  this.fake_mouse_x = this.w/2; 
  this.fake_mouse_y = this.h/2; 
  var self = this; 

  function f_down(event){
    var rect = self.canvas.getBoundingClientRect();
    var ev = getTouch(event); 
    self.mouse_x = ev.x - rect.left;
    self.mouse_y = ev.y - rect.top;
    self.is_dragging=true;
    self.selector.onclick(self.mouse_x, self.mouse_y);
  } 

  function f_up(event){
      self.is_dragging=false;
  }

  function f_out(event){
      self.is_dragging=false;
      if(!self.audio_player.paused) self.audio_player.pause();
        self.playing_layer = -1 ; 
        self.selected_layer = -1; 
  }

  function f_move(event){
    var rect = self.canvas.getBoundingClientRect();
    var old_x = self.mouse_x; 
    var old_y = self.mouse_y; 
    var ev = getTouch(event);
    self.mouse_x = ev.x - rect.left ;
    self.mouse_y = ev.y - rect.top ;
    var deltaX = old_x - self.mouse_x; 
    var deltaY = old_y - self.mouse_y; 
    if(self.is_dragging){
      self.move(deltaX, deltaY);
      self.mouse_x = old_x;
      self.mouse_y = old_y;
    } else {
      self.onmousemove(self.mouse_x, self.mouse_y);  
    }
  }

  this.canvas.onmousedown = f_down;
  this.canvas.ontouchstart = f_down; 
  this.canvas.onmouseup = f_up; 
  this.canvas.ontouchend = f_up;
  this.canvas.onmouseout = f_out; 
  this.canvas.ontouchout = f_out;
  this.canvas.onmousemove = f_move;
  this.canvas.ontouchmove = f_move;
}

LengthChart.prototype.move = function(deltaX, deltaY){
  this.fake_mouse_x -= deltaX ; 
  this.mouse_select(this.fake_mouse_x);
}

LengthChart.prototype.onmousemove = function(deltaX, deltaY){
  this.mouse_select(this.mouse_x);
  this.selector.onmousemove(deltaX, deltaY);
}

LengthChart.prototype.mouse_select = function(x){
  var layer = this.resolve_layer(x);
  this.select(layer);
}

LengthChart.prototype.select = function(layer){
  if(layer == this.selected_layer)  return; 
  if(layer == this.playing_layer)  return; 
  this.need_render = true; 
  this.selected_layer = layer; 

  var self = this; 
  setTimeout(function (){
    if(self.selected_layer == layer)  self.play(layer);
  }, 500); 
}

LengthChart.prototype.play = function(layer){
  if(this.playing_layer == layer)  return; 
  this.playing_layer = layer;

  this.audio_player.pause();
  if (layer < 0) return 
  var url = 'https://storage.googleapis.com/audiozation/audios/length_chart/'+ this.url + '/' + this.key_arr[this.selected] + '/' + layer +'.mp3';
  // var url = 'https://storage.googleapis.com/audiozation/audios/' + this.url + '/'+ (layer) + '.mp3';
  this.audio_player.src = url;
  this.audio_player.play();
}

LengthChart.prototype.draw = function(){
  if(!isInViewport(this.element))  return;

  if(this.need_render){
    
    this.erase();
    // this.draw_axis();

    for(var i=0;i<this.color.length;i++)
      this.draw_activatons(this.data[this.key_arr[i]], this.color[i]);

    this.ctx.font = '16px arial';
    this.ctx.fillStyle = 'white';
    this.ctx.globalAlpha = 0.7 ; 
    this.ctx.fillRect(0, 0, this.w, this.h);
    this.ctx.globalAlpha = 1.; 

    this.draw_axis();
    this.draw_activatons(this.data[this.key_arr[this.selected]], this.color[this.selected]);


    this.draw_curser();

    this.selector.draw();

    this.need_render = false ;

    // for(var i=0;i<global_good_colors.length;i++){
    //   this.ctx.fillStyle = global_good_colors[i];
    //   var size = 30; 
    //   this.ctx.fillRect(i*size, 0, (i+1)*size, size);
    // }
  }
}

LengthChart.prototype.draw_curser = function(){
  if (this.selected_layer < 0) return;
  this.ctx.globalAlpha = 0.5; 
  this.ctx.fillStyle = this.color[this.selected]; 
  var half = this.translate_x(0.5) - this.translate_x(0);;
  var left = this.translate_x(this.selected_layer) - half ;
  var right = this.translate_x(this.selected_layer+1) - half;
  var top = this.translate_y(this.max_y_axis);
  var bot = this.translate_y(0);
  this.ctx.fillRect(left, top, right - left, bot - top);
  this.ctx.globalAlpha = 1;
}

LengthChart.prototype.compile_data = function(){
  this.max_x_axis = this.data['avg'].length;
  this.max_y_axis = get_max(this.data);
  this.unit_x = get_unit(this.max_x_axis);
  this.unit_y = get_unit(this.max_y_axis);
  this.round_x = Math.floor(.9 * this.max_x_axis / this.unit_x);
  this.round_y = Math.floor(.9 * this.max_y_axis / this.unit_y);
  this.anchor_x = print_unit(this.round_x * this.unit_x);
  this.anchor_y = print_unit(this.round_y * this.unit_y);
}


LengthChart.prototype.resolve_layer = function(x){
  if (x < -this.margin)  return -1; 
  var half = this.translate_x(0.5) - this.translate_x(0); 
  x = x + half; 
  var w = (this.w - 2*this.margin) / (this.max_x_axis);
  var layer = Math.floor((x - this.margin) / w);

  if (layer < this.max_x_axis && layer >= 0) return layer; 
  return -1; 
}

LengthChart.prototype.html = function(){
  var content = "";
  content += "<canvas class='canvas_div'></canvas>";
  content += "<audio controls class='audio_player' style='display:none'>'<source src='' type='audio/wav'> Your browser does not support this audio'; </audio> " ;
  return content;
}

LengthChart.prototype.translate_y = function(y){
  return this.h - this.margin - (y / this.max_y_axis) * (this.h - 2*this.margin);
}


function LengthSelector(parent, colors, labels, width=500, ww=500, wh=900, parent_m=10){
  this.parent = parent; 
  this.ctx = parent.ctx; 

  this.hover = -1; 

  this.colors = colors; 
  this.labels = labels;
  var count = colors.length ; 
  this.count = count; 

  var unit = 1; 
  var text = unit * 3.5 ; 
  var total_units = (unit + text + unit) * count + unit ; 

  this.legend =width / total_units;
  this.margin = this.legend; 
  this.text_size = this.legend * text; 

  this.h = this.margin * 2 + this.legend;
  this.w = width;  
  this.x = parent_m * 2 ; 
  this.y = parent_m; 
}

LengthSelector.prototype.draw = function(){
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

  if (navigator.userAgent.indexOf('Chrome') == -1)  font_family = 'px sans-serif';

  this.ctx.beginPath()
  this.ctx.fillStyle = 'white';
  this.ctx.strokeStyle = 'white';
  var text_to_view = 'Metric';
  var metrics = this.ctx.measureText(text_to_view);
  var height_text = metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;
  var measure =  metrics.width;
  this.ctx.rect(this.x+this.w/2-(measure/2)-2, this.y-height_text/2-2, measure+4, height_text+4);
  this.ctx.fill();
  this.ctx.fillStyle='black'
  this.ctx.fillText(text_to_view, this.x+this.w/2-(measure/2), this.y)
  this.ctx.stroke();
  
  var width_text = this.ctx.measureText('Mean').width
  var width_selector = this.margin + this.legend + this.text_size;
  this.ctx.strokeStyle = 'black';

  for(var i=0;i<this.labels.length;i++){
    this.ctx.fillStyle = this.colors[i];
    if (i!=this.hover){
      this.ctx.font= font_size + font_family;
      this.ctx.lineWidth = 1;
    } else {
      this.ctx.font= (font_size+2) + font_family;
      this.ctx.lineWidth = 2;
    }
    if (this.parent.selected ==i || i==this.hover)  this.ctx.globalAlpha = 1; 
    else              this.ctx.globalAlpha = 0.1;

    this.ctx.beginPath();
    this.ctx.rect(cx, cy, this.legend, this.legend);
    this.ctx.fillText(this.labels[i], cx + this.legend+5, cy + this.legend/2); 
    this.ctx.fill();
    this.ctx.stroke();
    cx += width_selector;
  }
  this.ctx.globalAlpha = 1;
}

LengthSelector.prototype.get_box = function(x, y){
  var cx = this.margin + this.x; 
  var cy = this.margin + this.y; 
  var add = this.margin + this.legend + this.text_size;
  var width_selector = this.margin + this.legend + this.text_size;
  if(this.x <= x && x <= this.x + this.w  && this.y + this.margin <= y && y <= this.y + this.h - this.margin){
    for(var i=0;i<this.labels.length;i++){
      // if (i!=9) var width_text = this.ctx.measureText('9').width
      // else var width_text = this.ctx.measureText('10').width
      if(cx <= x && x <= cx + add) return i; 
      cx += width_selector ; 
    }
  }
  return -1; 
}

LengthSelector.prototype.onmousemove = function(x, y){
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

LengthChart.prototype.onselect = function(i){
    this.selected = i; 
    this.need_render = true;
    var keep =this.playing_layer ; 
    this.playing_layer = -1;
    this.play(keep);
}

LengthSelector.prototype.onclick = function(x, y){
  var index = this.get_box(x, y);
  if(index != -1) this.parent.onselect(index);
}




