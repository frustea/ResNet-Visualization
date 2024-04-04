function OverviewChart(id){
	this.element = document.getElementById(id);
	this.element.innerHTML = this.html()
	this.canvas = this.element.getElementsByClassName('overview_canvas')[0];
	this.ctx = this.canvas.getContext('2d');
	this.need_render = true;

	this.w = Math.floor(this.element.clientWidth);
  	this.h = Math.max(Math.floor(this.w * 1.5 / 4), 300);
  	this.ctx.canvas.width = this.w; 
  	this.ctx.canvas.height = this.h;
  	this.set_listeners();

  	var encoder_portion = 11 ; 
  	var arrow_portion = 0.75 ;
  	var net_portion = 1.; 
  	var margin_portion = 1.;
  	var uw = this.w / (encoder_portion + net_portion * 13 + margin_portion * 2 + arrow_portion * 11);
	this.margin = uw * margin_portion ; 
	this.arrow = uw * arrow_portion; 
	this.encoder = uw * encoder_portion; 
	this.net = uw * net_portion;

	var text_portion = 1 ;
	var net_portion = 3 ; 
	var uh = (this.h - 3.1 * this.margin) / (text_portion + net_portion); 
	this.net_h = net_portion * uh ; 
	this.text_h = text_portion * uh ;

	this.frames = 3;
	this.fake_data();
}	

OverviewChart.prototype.fake_data = function(){
	var total = this.net_h;

	this.wav = [];
	for(var i=0;i<total;i+=1) this.wav.push(Math.sin(i / this.net_h * Math.PI * 20) * Math.sin(i / this.net_h * Math.PI * 7) * Math.sin(i / this.net_h * Math.PI * 1.5)); 

	this.spec = [] ;
	for(var i=0;i<total;i++) {
		var temp = [] ; 
		for(j=0;j<5;j++)	temp.push(0.3 + (Math.random() - 0.5) * 0.3 );
		this.spec.push(temp);
	}

	this.mel = [] ;
	for(var i=0;i<total;i++) {
		var temp = [] ; 
		for(j=0;j<3;j++)	temp.push(Math.random());
		this.mel.push(temp);
	}

	this.feature = [] ;
	for(var i=0;i<total;i++) {
		var temp = [] ; 
		for(j=0;j<5;j++)	temp.push(Math.random());
		this.feature.push(temp);
	}

	this.prob = [] ;
	for(var i=0;i<total;i++) {
		var temp = [] ; 
		var index = Math.floor(Math.random() * 4);
		for(j=0;j<4;j++){
			if(j == index)	temp.push(1);
			else temp.push(0);
		}	
		this.prob.push(temp);
	}

	this.chars = ['F', '/', 'I', 'V', '/', 'E', '/'];
}

OverviewChart.prototype.clear = function(){
	this.ctx.fillStyle = 'white';
	this.ctx.fillRect(0, 0, this.w, this.h);
}

OverviewChart.prototype.draw = function(){
	if(this.need_render){
		this.ctx.font = '10px arial';
		this.clear();
		this.ctx.textAlign = 'center';

		this.ctx.fillStyle = 'black';
		this.ctx.fillText('Under Construction', this.w/2, this.h/2);

		var cx = this.margin; 
		var cy = 2 * this.margin ; 
		var ch = this.net_h; 

		// Axis
		this.draw_axis(cx, cy, this.net, ch);
		cx += this.net ; 

		// Wave
		this.draw_wave(cx, cy, this.net, ch, 0, this.wav.length);
		cx += this.net;

		// Frame
		this.draw_frames(cx, cy, this.net, ch);
		cx += this.net + this.arrow ; 

		// Small Frames
		this.draw_small_frames(cx, cy, this.net, ch);
		cx += this.net;
		this.draw_arrow(cx);
		cx += this.arrow ; 
		
		// CTFT
		this.draw_stft(cx, cy, this.net, ch);
		cx += this.net;
		this.draw_arrow(cx);
		cx += this.arrow ; 

		// Sectrogram
		this.draw_spec(cx, cy, this.net, ch);
		cx += this.net;
		this.draw_arrow(cx);
		cx += this.arrow ; 

		// Mel
		this.draw_mel(cx, cy, this.net, ch);
		cx += this.net;
		this.draw_arrow(cx);
		cx += this.arrow ; 

		// Mel-Spectrogram
		this.draw_mel_spec(cx, cy, this.net, ch);
		cx += this.net;
		this.draw_arrow(cx);
		cx += this.arrow ;

		// Encoder
		this.draw_encoder(cx, cy, this.encoder, ch);
		cx += this.encoder;
		this.draw_arrow(cx);
		cx += this.arrow ;

		// Features
		this.draw_features(cx, cy, this.net, ch);
		cx += this.net;
		this.draw_arrow(cx);
		cx += this.arrow ;
		
		
		// Decoder
		this.draw_decoder(cx, cy, this.net, ch);
		cx += this.net;
		this.draw_arrow(cx);
		cx += this.arrow ;
		
		
		// Probabilities
		this.draw_probs(cx, cy, this.net, ch);
		cx += this.net;
		this.draw_arrow(cx);
		cx += this.arrow ;
		
		
		// CTC
		this.draw_ctc(cx, cy, this.net, ch);
		cx += this.net;
		this.draw_arrow(cx);
		cx += this.arrow ;
		
		// Characters
		this.draw_chars(cx, cy, this.net, ch);

		this.ctx.stroke();

		cx = this.margin + this.net * 2 ; 
		cy = this.margin  * 1.5;
		var gap = 5;  
		cx += gap;
		this.ctx.beginPath(); 
		this.ctx.moveTo(cx, cy + gap);
		this.ctx.lineTo(cx, cy);
		this.ctx.textAlign='center';
		var add = (this.net + this.arrow) * 5  + (this.net/ 2) - 2 * gap - this.arrow;
		this.ctx.fillText('Data Preprocessing', cx + add/2, cy - this.margin/2);
		cx += add ; 
		this.ctx.lineTo(cx ,cy);
		this.ctx.lineTo(cx, cy + gap);
		this.ctx.stroke();

		cx += (this.net/2) + 2 * gap + this.arrow; 

		this.ctx.beginPath(); 
		this.ctx.moveTo(cx, cy + gap);
		this.ctx.lineTo(cx, cy);
		add = (this.net + this.arrow) * 2  + this.encoder + this.arrow + (this.net/ 2) - 2 * gap;
		this.ctx.fillText('Jasper', cx + add/2, cy - this.margin/2);
		cx += add; 
		this.ctx.lineTo(cx ,cy);
		this.ctx.lineTo(cx, cy + gap);
		this.ctx.stroke();

		this.draw_texts();

		this.need_render = false;
	}
}

OverviewChart.prototype.draw_stft = function(cx, cy, cw, ch) {
	this.ctx.fillStyle = global_good_colors[14]; 
	this.ctx.fillRect(cx, cy, cw, ch);
	this.ctx.textAlign = 'center';
	this.ctx.textBaseline = "middle"; 
	this.ctx.fillStyle = 'white';
	this.ctx.rotate(-Math.PI/2);
	this.ctx.fillText('Short Time Fourier Transform', -(cy + ch / 2) , cx + cw / 2);
	this.ctx.rotate(Math.PI/2);
}


OverviewChart.prototype.draw_mel = function(cx, cy, cw, ch) {
	this.ctx.fillStyle = global_good_colors[24]; 
	this.ctx.fillRect(cx, cy, cw, ch);
	this.ctx.textAlign = 'center';
	this.ctx.textBaseline = "middle"; 
	this.ctx.fillStyle = 'white';
	this.ctx.rotate(-Math.PI/2);
	this.ctx.fillText('Mel Filters', -(cy + ch / 2) , cx + cw / 2);
	this.ctx.rotate(Math.PI/2);
}

OverviewChart.prototype.draw_encoder = function(cx, cy, cw, ch) {
	this.ctx.fillStyle = global_good_colors[10]; 
	this.ctx.fillRect(cx, cy, cw, ch);
	this.ctx.textAlign = 'center';
	this.ctx.textBaseline = "middle"; 
	this.ctx.fillStyle = 'white';
	this.ctx.rotate(-Math.PI/2);
	var gap = 10; 
	this.ctx.fillText('53 Layers', -(cy + ch / 2) , cx + cw / 2 + gap);
	this.ctx.fillText('Encoder', -(cy + ch / 2) , cx + cw / 2 - gap);
	this.ctx.rotate(Math.PI/2);
}

OverviewChart.prototype.draw_decoder = function(cx, cy, cw, ch) {
	this.ctx.fillStyle = global_good_colors[8]; 
	this.ctx.fillRect(cx, cy, cw, ch);
	this.ctx.textAlign = 'center';
	this.ctx.textBaseline = "middle"; 
	this.ctx.fillStyle = 'white';
	this.ctx.rotate(-Math.PI/2);
	this.ctx.fillText('Decoder', -(cy + ch / 2) , cx + cw / 2 );
	this.ctx.rotate(Math.PI/2);
	// this.draw_colors();
}

OverviewChart.prototype.draw_ctc = function(cx, cy, cw, ch) {
	this.ctx.fillStyle = global_good_colors[1]; 
	this.ctx.fillRect(cx, cy, cw, ch);
	this.ctx.textAlign = 'center';
	this.ctx.textBaseline = "middle"; 
	this.ctx.fillStyle = 'white';
	this.ctx.rotate(-Math.PI/2);
	this.ctx.fillText('Connectionist Temporal Classification', -(cy + ch / 2) , cx + cw / 2 );
	this.ctx.rotate(Math.PI/2);
	// this.draw_colors();
}

OverviewChart.prototype.draw_axis = function(cx, cy, cw, ch) {
	this.strokeStyle = 'black'; 
	this.ctx.beginPath();
	var uw = cw / 20 ; 
	var lx = cx + cw / 2;
	this.ctx.moveTo(lx, cy);
	this.ctx.lineTo(lx, cy+ch); 
	var csize = 2 * this.frames + 2; 
	var uh = ch / csize;  
	for(var i=0;i<=csize;i++){
		var cu = (2 - (i % 2)) * uw ; 
		this.ctx.moveTo(lx - cu, cy + i * uh);
		this.ctx.lineTo(lx + cu - uw, cy + i * uh);
	}
	this.ctx.textAlign = 'center'; 
	this.fillStyle = 'black'; 
	for(var i=0; i <= csize ; i += 8 ){
		this.ctx.moveTo(lx - uw * 3, cy + ch - i * uh);
		this.ctx.lineTo(lx + uw * 3, cy + ch - i * uh);
		this.ctx.rotate(-Math.PI/2);
		this.ctx.fillText((i * 10) + 'ms', -( cy + ch - i * uh + 2) , this.margin);
		this.ctx.rotate(Math.PI/2);
	}
	this.ctx.moveTo(lx - uw * 3, cy);
	this.ctx.lineTo(lx + uw * 3, cy);
	this.ctx.stroke();
}

OverviewChart.prototype.draw_wave = function(cx, cy, cw, ch, start, end, box=false) {
	this.ctx.strokeStyle = global_good_colors[0]; 
	this.ctx.beginPath();
	var push = ch / (end - start);
	var uw = cw / 2;
	var lx = cx + uw;
	this.ctx.moveTo(lx + this.wav[start] * uw, cy + 0);
	for(var i=start;i<=end;i++)	this.ctx.lineTo(lx + this.wav[i] * uw, cy + (i - start)*push );
	if(box)	this.ctx.rect(cx, cy, cw, ch);
	this.ctx.stroke();
	this.ctx.strokeStyle = 'black';
}

OverviewChart.prototype.draw_frames = function(cx, cy, cw, ch) {
	this.strokeStyle = 'black'; 
	this.ctx.beginPath();

	var csize = 2 * this.frames + 2; 
	var uw = cw / 8 ;
	var lx = cx + uw;
	var uh = ch / csize ;  
	var gap = uw * 2 ; 

	for(var i=0;i+2<=csize ;i+=2){	
		this.draw_frame(lx, cy + i * uh + gap, uw,  uh - gap);
		this.draw_arrow(lx + 2 * uw, cy + (i+1) * uh , this.arrow + cw/2 );
	}

	lx += cw / 2 ; 
	for(var i=1;i+2<=csize ;i+=2){
		this.draw_frame(lx, cy + i * uh + gap, uw,  uh - gap);
		this.draw_arrow(lx + 2 * uw, cy + (i+1) * uh);
	}

	this.ctx.stroke();
}

OverviewChart.prototype.draw_small_frames = function(cx, cy, cw, ch){
	this.strokeStyle = 'black'; 
	this.ctx.beginPath();

	var csize = 2 * this.frames + 2; 
	var gap = 2; 
	var lx = cx + gap;
	var uh = ch / csize ;  


	for(var i=0;i<csize-1 ;i++)
		this.draw_wave(lx, cy + uh * (i + 0.5) + gap, cw - 2*gap, uh - 2 * gap, Math.floor(i * uh), Math.floor(i * uh)+ 2*uh,  true);
	this.ctx.beginPath();
}

OverviewChart.prototype.draw_spec = function(cx, cy, cw, ch){
	var csize = 2 * this.frames + 2; 
	var uh = ch / csize ;
	cy += uh / 2;
	ch -= uh ; 
	var uw = cw / 5; 
	this.ctx.fillStyle = global_good_colors[15];
	this.ctx.fillRect(cx, cy, cw, ch);
	this.ctx.fillStyle = 'black';

	for(var i=0;i<csize - 1;i++)
		for(var j=0;j<5;j++){
			this.ctx.globalAlpha = this.spec[i][j]; 
			this.ctx.fillRect(cx + j * uw, cy + i * uh, uw, uh);
		}
	this.ctx.globalAlpha = 1.;
}

OverviewChart.prototype.draw_mel_spec = function(cx, cy, cw, ch){
	var csize = 2 * this.frames + 2; 
	var uh = ch / csize ;
	cy += uh / 2;
	ch -= uh ; 
	var uw = cw / 3; 
	this.ctx.fillStyle = global_good_colors[30];
	this.ctx.fillRect(cx, cy, cw, ch);
	this.ctx.fillStyle = global_good_colors[2];

	for(var i=0;i<csize - 1;i++)
		for(var j=0;j<3;j++){
			this.ctx.globalAlpha = this.mel[i][j]; 
			this.ctx.fillRect(cx + j * uw, cy + i * uh, uw, uh);
		}
	this.ctx.globalAlpha = 1.;
}

OverviewChart.prototype.draw_features = function(cx, cy, cw, ch){
	var csize = 2 * this.frames + 2; 
	var uh = ch / csize ;
	cy += uh / 2;
	ch -= uh ; 
	var uw = cw / 4; 
	this.ctx.fillStyle = global_good_colors[3];
	this.ctx.fillRect(cx, cy, cw, ch);
	this.ctx.fillStyle = global_good_colors[26];

	for(var i=0;i<csize - 1;i++)
		for(var j=0;j<4;j++){
			this.ctx.globalAlpha = this.feature[i][j]; 
			this.ctx.fillRect(cx + j * uw, cy + i * uh, uw, uh);
		}
	this.ctx.globalAlpha = 1.;
}

OverviewChart.prototype.draw_probs = function(cx, cy, cw, ch){
	var csize = 2 * this.frames + 2; 
	var uh = ch / csize ;
	cy += uh / 2;
	ch -= uh ; 
	var uw = cw / 4; 
	this.ctx.fillStyle = global_good_colors[16];
	this.ctx.fillRect(cx, cy, cw, ch);
	this.ctx.fillStyle = global_good_colors[15];

	for(var i=0;i<csize - 1;i++)
		for(var j=0;j<4;j++){
			this.ctx.globalAlpha = this.prob[i][j]; 
			this.ctx.fillRect(cx + j * uw, cy + i * uh, uw, uh);
		}
	this.ctx.globalAlpha = 1.;
	// this.draw_colors();
}

OverviewChart.prototype.draw_chars = function(cx, cy, cw, ch){
	var csize = 2 * this.frames + 2; 
	var uh = ch / csize ;
	cy += uh / 2;
	this.ctx.fillStyle = 'black';

	this.ctx.rotate(-Math.PI/2);
	for(var i=0;i<csize - 1;i++){
		this.ctx.fillText(this.chars[this.chars.length - i - 1],  -(cy + i * uh + uh/2), cx + cw/2);
	}
	this.ctx.rotate(Math.PI/2);
	this.ctx.rect(cx, cy , cw, ch - uh);
}


OverviewChart.prototype.draw_colors = function(){
	var size = 20; 
	for(var i=0;i<global_good_colors.length;i++){
		this.ctx.fillStyle = global_good_colors[i];
		this.ctx.fillRect(i*size, 0, (i+1)*size, size);
		this.ctx.fillText(i, i*size + size/2, size + 5);
	}
}


OverviewChart.prototype.draw_frame = function(cx, cy, cw, ch){
	this.ctx.moveTo(cx, cy); 
	this.ctx.lineTo(cx + cw, cy); 
	this.ctx.lineTo(cx + cw, cy + ch); 
	this.ctx.lineTo(cx + 2*cw, cy + ch);
	this.ctx.lineTo(cx + cw, cy + ch); 
	this.ctx.lineTo(cx + cw, cy + 2*ch);
	this.ctx.lineTo(cx, cy+2*ch);
}

OverviewChart.prototype.draw_texts = function(){
	this.ctx.rotate(-Math.PI/2);
	this.ctx.textAlign = "right";
	this.ctx.fillStyle = 'black';

	var cx = this.margin ; 
	var cl = this.net / 2; 
	var cy = - (this.h - this.margin - this.text_h); 
	this.ctx.textBaseline = "middle"; 

	// Axis 
	this.ctx.fillText('Time', cy, cx + cl); 
	cx += this.net ; 

	// Wave
	this.ctx.fillText('Wave Form', cy, cx + cl); 
	cx += this.net ; 

	// Frame
	// this.ctx.fillText('Frame', cy, cx + cl); 
	cx += this.net + this.arrow ; 

	// Small 
	this.ctx.fillText('Frame', cy, cx + cl); 
	cx += this.net + this.arrow ; 

	// CTFT
	this.ctx.fillText('STFT', cy, cx + cl); 
	cx += this.net + this.arrow ; 

	// Sectrogram
	this.ctx.fillText('Spectrogram', cy, cx + cl); 
	cx += this.net + this.arrow ; 

	// Mel
	this.ctx.fillText('Mel-Filters', cy, cx + cl); 
	cx += this.net + this.arrow ; 

	// Mel-Spectrogram
	var text_size = 6; 
	this.ctx.fillText('Mel-Spectrogram', cy, cx + cl - text_size); 
	this.ctx.fillText('(Japser\'s Input)', cy , cx + cl + text_size); 
	cx += this.net + this.arrow ; 

	// Encoder
	this.ctx.fillText('Encoder', cy, cx + this.encoder/2); 
	cx += this.encoder + this.arrow ; 

	// Features
	this.ctx.fillText('Features', cy, cx + cl); 
	cx += this.net + this.arrow ; 
	
	// Decoder
	this.ctx.fillText('Decoder', cy, cx + cl); 
	cx += this.net + this.arrow ; 
	
	// Probabilities
	this.ctx.fillText('Probabilities', cy, cx + cl - text_size); 
	this.ctx.fillText('(Japser\'s Output)', cy , cx + cl + text_size); 
	cx += this.net + this.arrow ; 
	
	// CTC
	this.ctx.fillText('CTC', cy, cx + cl); 
	cx += this.net + this.arrow ; 
	
	// Characters
	this.ctx.fillText('Characters', cy, cx + cl); 
	this.ctx.rotate(+Math.PI/2);
}

OverviewChart.prototype.draw_arrow = function (cx, ch=2*this.margin + this.net_h/2 , len=this.arrow) {
	var head = this.arrow / 5 ; 
	this.ctx.moveTo(cx, ch);
	this.ctx.lineTo(cx + len, ch);
	this.ctx.lineTo(cx + len - head, ch - head);
	this.ctx.moveTo(cx + len, ch);
	this.ctx.lineTo(cx + len - head, ch + head);
}

OverviewChart.prototype.html = function(){
	var content = ""; 
	content += "<canvas class='overview_canvas' display='block'> </canvas>"; 
	return content; 
}


OverviewChart.prototype.set_listeners = function(){
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


OverviewChart.prototype.move = function(deltaX, deltaY){
  this.fake_mouse_x -= deltaX ; 
  this.fake_mouse_y -= deltaY ; 
  this.mouse_select(this.fake_mouse_x, this.fake_mouse_y);
}

OverviewChart.prototype.onmousemove = function(deltaX, deltaY){
  this.mouse_select(this.mouse_x, this.mouse_y);
}

OverviewChart.prototype.mouse_select = function(x, y){
}