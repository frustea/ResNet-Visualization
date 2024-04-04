function GenderFloatHeatMap(id, data, scale=1){
    this.element = document.getElementById(id);
    this.data = data; 

    this.element.innerHTML = this.html();

    this.canvas = this.element.getElementsByClassName('canvas_div')[0];
    this.audio_player = this.element.getElementsByClassName('audio_player')[0];
    this.ctx = this.canvas.getContext("2d");
    this.w = Math.floor(this.element.clientWidth);

    this.n_layers = data.length;

    var cmargin = Math.floor(this.w/50 * scale);
    var cw = Math.floor( (this.w - 2 * cmargin) / (this.n_layers+2)); 
    this.margin = (this.w - this.n_layers * cw) / 2; 
    this.arrow = this.margin / 8 / 2;
    this.h = this.margin * 2 + 0.5 * this.data[this.data.length-1].length;

    this.ctx.canvas.width = this.w; 
    this.ctx.canvas.height = this.h;
    this.analyze();
    this.set_listeners();

    this.selected_layer = -1; 
    this.selected_feature = -1; 
    this.need_render = true; 
    this.playing_layer = -1;
    this.playing_feature = -1;
  }

  GenderFloatHeatMap.prototype.html = function(){
    var context = "";
    context += "<canvas class='canvas_div'></canvas>";
    context += "<audio controls class='audio_player' style='display:none'>'<source src='' type='audio/wav'> Your browser does not support this audio'; </audio> " ;
    return context;
  }


  GenderFloatHeatMap.prototype.erase = function(){
    this.ctx.fillStyle = 'white'; 
    this.ctx.fillRect(0, 0, this.w, this.h);
  }

  GenderFloatHeatMap.prototype.loading = function(){
    this.ctx.fillStyle = 'black';
    this.ctx.textAlign = "center"; 
    this.ctx.textBaseline = "middle"; 
    this.ctx.font = '16px arial';
    this.ctx.fillText('Loading... Please Wait...', this.w/2, this.h/2);
  }

  GenderFloatHeatMap.prototype.needs_loading = function(){
    return false; 
  }

  GenderFloatHeatMap.prototype.draw = function(){
    if(this.need_render){
      this.erase();
      if(this.needs_loading())  this.loading();
      else {
        this.draw_layers();
      }
      this.need_render = false;
    }
  }

  GenderFloatHeatMap.prototype.analyze = function(){
    this.index = [] ;
    for(var l=0;l<this.n_layers;l++){
      var temp = [] ;
      var layer = this.data[l]; 

      for(var i=0;i<layer.length;i++) temp.push([layer[i], i]);
      temp.sort();
      temp.reverse();
      this.index.push(temp);
    }
  }

  GenderFloatHeatMap.prototype.color = function(female){
    var val = Math.floor(female * 255);
    var val2 = Math.floor(female * 255 * 2);
    if (female <= 0.5)  return 'rgb(' + 255 + ',' + val2 + ',' + 0 + ')';
    return 'rgb(' + (2*255-val2) + ',' + (2*255-val2) + ',' + (val2 - 255) + ')';
  }

  GenderFloatHeatMap.prototype.set_listeners = function(){
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
    } 

    function f_up(event){
        self.is_dragging=false;
    }

    function f_out(event){
        self.is_dragging=false;
        if(!self.audio_player.paused) self.audio_player.pause();
        self.playing_feature = -1 ; 
        self.playing_layer = -1 ; 
        self.selected_layer = -1; 
        self.selected_feature = -1; 
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


  GenderFloatHeatMap.prototype.draw_layers = function(){
    var x = this.margin; 
    var w = (this.w - 2*this.margin) / (this.n_layers + 2);
    for(var l=0;l<this.index.length;l++){
      var layer = this.index[l]; 
      var y = this.margin; 
      var h = (this.h - 2*this.margin) / layer.length; 
      
      for(var i=0;i<layer.length;i++){
        
        if(i==this.selected_feature && l==this.selected_layer){
          this.ctx.fillStyle = 'white';
          this.ctx.fillRect(x, y-this.arrow, w, h+this.arrow);   
        } else {
          this.ctx.fillStyle =  this.color(layer[i][0]);
          this.ctx.fillRect(x, y, w, h);   
        }
        
        y += h;
      }
      x += w ; 
    }

    x += w ;
    var y = this.margin ;
    var h = Math.floor(this.h - 2 * this.margin);
    var grd = this.ctx.createLinearGradient(0, y, 0, h+y);
    grd.addColorStop(0,'blue');
    grd.addColorStop(0.5, 'yellow');
    grd.addColorStop(1,'red');
    this.ctx.fillStyle = grd ; 
    this.ctx.rect(x, y, w, h);
    this.ctx.fill();
    this.ctx.stroke();

    this.ctx.beginPath();
    this.ctx.moveTo(this.margin, this.margin);
    this.ctx.lineTo(this.margin, this.h - this.margin);
    this.ctx.lineTo(this.w - this.margin - 2*w, this.h - this.margin);
    this.ctx.lineWidth = 2; 
    this.ctx.stroke();
    this.ctx.lineWidth = 1;

    var first_layer_h = (this.h - 2 * this.margin) / this.data[0].length;
    this.ctx.beginPath();
    this.ctx.moveTo(this.margin, this.margin + first_layer_h); 
    this.ctx.lineTo(this.margin - this.arrow, this.margin + first_layer_h); 
    this.ctx.stroke();

    this.ctx.beginPath();
    this.ctx.moveTo(this.margin, this.h - this.margin - first_layer_h); 
    this.ctx.lineTo(this.margin - this.arrow, this.h - this.margin - first_layer_h); 
    this.ctx.stroke();

    this.ctx.beginPath();
    this.ctx.moveTo(this.w - this.margin, this.margin ); 
    this.ctx.lineTo(this.w - this.margin + this.arrow, this.margin); 
    this.ctx.stroke();

    this.ctx.beginPath();
    this.ctx.moveTo(this.w - this.margin, this.h - this.margin ); 
    this.ctx.lineTo(this.w - this.margin + this.arrow, this.h - this.margin); 
    this.ctx.stroke();

    this.ctx.beginPath();
    this.ctx.moveTo(this.w - this.margin, this.h /2 ); 
    this.ctx.lineTo(this.w - this.margin + this.arrow, this.h /2); 
    this.ctx.stroke();

    x = this.margin + w / 2;
    for(var i=0;i<this.data.length;i++){
      this.ctx.beginPath();
      this.ctx.moveTo(x, this.h - this.margin ); 
      this.ctx.lineTo(x, this.h - this.margin + this.arrow); 
      this.ctx.stroke();
      x += w;
    }


    this.ctx.fillStyle = 'black';
    this.ctx.textAlign = "center"; 
    this.ctx.textBaseline = "middle"; 

    this.ctx.fillText('Gender Specializatoin Heatmap', this.w /2  , this.margin / 2) ;
    this.ctx.fillText('Layer' , this.w/2, this.h - this.margin / 3) ;

    x = this.margin + w/2 + (10 * w); 
    for(var i=10;i<this.data.length;i+=10){
      this.ctx.fillText(i , x, this.h - 2 * this.margin / 3) ;          
      x+= 10 * w; 
    }

    this.ctx.rotate(-Math.PI/2);
    this.ctx.fillText('Features', -(this.h /2), (this.margin / 3)) ;
    this.ctx.textAlign = "right"; 
    this.ctx.fillText('Female Dominated Feature', -(this.margin), (2* this.margin / 3)) ;
    this.ctx.fillText('Female Dominated', -(this.margin), (this.w - 2 * this.margin / 3)) ;
    this.ctx.textAlign = "left"; 
    this.ctx.fillText('Male Dominated Feature', -(this.h - this.margin), (2* this.margin / 3)) ;
    this.ctx.fillText('Male Dominated', -(this.h - this.margin), (this.w - 2* this.margin / 3)) ;

    this.ctx.textAlign = "center"; 
    this.ctx.fillText('Gender Neutral', -(this.h/2), (this.w - 2* this.margin / 3)) ;
    this.ctx.rotate(+Math.PI/2);
  }



GenderFloatHeatMap.prototype.move = function(deltaX, deltaY){
  this.fake_mouse_x -= deltaX ; 
  this.fake_mouse_y -= deltaY ; 
  this.mouse_select(this.fake_mouse_x, this.fake_mouse_y);
}

GenderFloatHeatMap.prototype.onmousemove = function(deltaX, deltaY){
  this.mouse_select(this.mouse_x, this.mouse_y);
}

GenderFloatHeatMap.prototype.mouse_select = function(x, y){
  var layer = this.resolve_layer(x);
  var feature = -1; 
  if(layer != -1) feature = this.resolve_feature(layer, y);
  this.select(layer, feature);
}

GenderFloatHeatMap.prototype.select = function(layer, feature){
  if(layer == this.selected_layer && this.selected_feature == feature)  return; 
  if(layer == this.playing_layer && this.playing_feature == feature)  return; 
  this.need_render = true; 
  this.selected_layer = layer; 
  this.selected_feature = feature; 

  var self = this; 
  setTimeout(function (){
    if(self.selected_feature == feature && self.selected_layer == layer)  self.play(layer, feature);
  }, 500); 
}

GenderFloatHeatMap.prototype.play = function(layer, feature){
  if(this.playing_layer == layer && this.playing_feature == feature)  return; 
  this.playing_feature = feature; 
  this.playing_layer = layer;
  if(layer == -1 || feature == -1){
    this.audio_player.pause();
    return;
  }
  var url = 'https://storage.googleapis.com/audiozation/audios/words_most/'+ layer + '_' +  this.index[layer][feature][1] +'.mp3';
  this.audio_player.pause();
  this.audio_player.src = url;
  this.audio_player.play();
}


GenderFloatHeatMap.prototype.resolve_layer = function(x, y){
  if (x < this.margin)  return -1; 
  var w = (this.w - 2*this.margin) / (this.n_layers + 2);
  var layer = Math.floor((x - this.margin) / w);
  if (layer < this.data.length) return layer; 
  return -1; 
}

GenderFloatHeatMap.prototype.resolve_feature = function(layer, y){
  if (y < this.margin)  return -1; 
  var h = (this.h - 2*this.margin) / (this.data[layer].length);
  var feature = Math.floor((y - this.margin) / h);
  if (feature < this.data[layer].length)  return feature;
  return -1;  
}