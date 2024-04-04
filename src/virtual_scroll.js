
function ScrollIndicator(ctx, x, y, w, h, dir=true){
	this.ctx = ctx; 
	this.x = x; 
	this.y = y;
	this.w = w; 
	this.h = h;
	this.dir = dir ; 
}

ScrollIndicator.prototype.draw = function(x){
	var val = x / this.w; 
	var grd = this.ctx.createLinearGradient(this.x, this.y, this.x+this.w, this.y);
	if(!this.dir){
		grd.addColorStop(0,'rgba(255, 255, 255, 1)');
	  	grd.addColorStop(1,'rgba(255, 255, 255, 0)');	
	} else {
		grd.addColorStop(0,'rgba(255, 255, 255, 0)');
	  	grd.addColorStop(1,'rgba(255, 255, 255, 1)');		
	}
  	this.ctx.fillStyle = grd;
  	this.ctx.fillRect(this.x, this.y, this.w, this.h);

	if(val < 1)	this.ctx.globalAlpha = val ;
  	this.ctx.fillStyle = 'gray'; 
  	this.ctx.beginPath(); 
  	var sign = 1; 
  	if(!this.dir)	sign = -1; 
  	var cen_y = this.y + this.h / 2;
  	var cen_x = this.x + this.w / 2;
  	var len = sign * this.w / 8 ;  
  	cen_x += 3*len ;
  	this.ctx.moveTo(cen_x + len, cen_y);
  	this.ctx.lineTo(cen_x , cen_y - len); 
  	this.ctx.lineTo(cen_x , cen_y - len/2);
  	this.ctx.lineTo(cen_x - len, cen_y - len/2);
  	this.ctx.lineTo(cen_x - len, cen_y + len/2);
  	this.ctx.lineTo(cen_x , cen_y + len/2); 
  	this.ctx.lineTo(cen_x , cen_y + len); 
  	this.ctx.lineTo(cen_x + len, cen_y);
  	this.ctx.fill(); 
  	// this.ctx.stroke();
  	this.ctx.globalAlpha = 1;
}

function bound(min_val, cur_val, max_val){
	if(cur_val < min_val) return min_val;
	if(cur_val > max_val) return max_val; 
	return cur_val;
}

function dig(obj, d=0){
	if (d == 1)	return ' ' + obj ; 
	var str = '[ ' + obj + ' : ';
    for (var key in event) str = str + ' (' + key + ' : ' + dig(event[key], d+1) + ') ' ; 
    str = str + ' ] ';
	return str; 
}

function VirtualScroll(id){
	this.id = id; 
	this.parent = document.getElementById(this.id);
	this.wwidth = Math.floor(this.parent.offsetWidth);
	this.wheight = Math.floor(this.parent.offsetHeight);
	this.rwidth = this.wwidth; 
	this.rheight = this.wheight; 

	this.x = 0 ;
	this.y = 0 ; 

	this.parent.innerHTML = "<canvas class='axis_graph_canvas'> </canvas>" ;
	this.canvas = this.parent.getElementsByClassName('axis_graph_canvas')[0];
	this.ctx = this.canvas.getContext('2d');
	this.ctx.canvas.width = this.wwidth;
	this.ctx.canvas.height = this.wheight;

	// this.animation_id = 0; 
	this.content = null; 



	var self = this; 
	var choises = ['onwheel', 'onmousewheel', 'DOMMouseScroll']; 
	// for(var i=0;i<choises.length;i++)	if(choises[i] in document)	console.log('Found ---> ', choises[i]);

	this.canvas.addEventListener('onwheel' in document ? 'wheel' : 'onmousewheel' in document ? 'mousewheel' : 'DOMMouseScroll', function(event){
		// var ev = getTouch(event);
		self.move(event.deltaX, event.deltaY);
		event.preventDefault();
	}, false);
	
	this.is_dragging = false; 
	this.mouse_x = -100; 
	this.mouse_y = -100;
	this.need_render = true;
	// this.touch_x = -100;
	// this.touch_y = -100;  

	function f_down(event){
      	var rect = self.canvas.getBoundingClientRect();
  		var ev = getTouch(event); 
		self.mouse_x = ev.x - rect.left + self.x;
		self.mouse_y = ev.y - rect.top + self.y;
      	self.is_dragging=true;
      	self.need_render = true;
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
		self.mouse_x = ev.x - rect.left + self.x;
		self.mouse_y = ev.y - rect.top + self.y;
		var deltaX = old_x - self.mouse_x; 
		var deltaY = old_y - self.mouse_y; 
		if(self.is_dragging){
			self.move(deltaX, deltaY);
			self.mouse_x = old_x;
			self.mouse_y = old_y;
		}
		 else {
		 	self.need_render = true;
			var content = self.get_content();
			if (content != null && content.onmousemove != undefined)	content.onmousemove(self.mouse_x, self.mouse_y);	
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

	this.canvas.onclick = function(event){
		var rect = self.canvas.getBoundingClientRect();
		self.mouse_x = event.clientX - rect.left + self.x;
		self.mouse_y = event.clientY - rect.top + self.y;
		var content = self.get_content(); 
		if (content != null && content.onmousemove != undefined)	content.onclick(self.mouse_x, self.mouse_y);
	}

	var siw = 60;
	this.left_scroll = new ScrollIndicator(this.ctx, 0, 0, siw , this.ctx.canvas.height, false);
	this.right_scroll = new ScrollIndicator(this.ctx, this.ctx.canvas.width - siw, 0, siw, this.ctx.canvas.height, true);
}

VirtualScroll.prototype.move = function(deltaX, deltaY){
	this.x += deltaX;
	this.y += deltaY; 
	this.x = bound(0, this.x, this.rwidth - this.wwidth );
	this.y = bound(0, this.y, this.rheight - this.wheight );
	this.need_render = true;
}

VirtualScroll.prototype.get_content = function(){
	return this.content;
}

// VirtualScroll.prototype.animate = function(){
// 	this.animation_id = window.requestAnimationFrame(this.animate.bind(this));
// 	this.draw();
// }


VirtualScroll.prototype.clean = function(){
	this.ctx.fillStyle = "rgba(255, 255, 255, 1)";
	this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
}

VirtualScroll.prototype.draw = function(){
	if(!this.need_render)	return; 
	if(!isInViewport(this.parent))	return ;
	this.clean();
	if (this.content != null){
		this.content.draw(this.x, this.y, this.wwidth, this.wheight);
		this.left_scroll.draw(this.x);
		this.right_scroll.draw(this.content.get_width() - this.wwidth - this.x);
	}	
	else this.loading();
	this.need_render =false; 
}

VirtualScroll.prototype.loading = function(){
	this.ctx.fillStyle = 'black';
	this.ctx.textAlign = "center"; 
	this.ctx.textBaseline = "middle"; 
	this.ctx.fillText('Loading... Please Wait...', this.wwidth/2, this.wheight/2);
}

VirtualScroll.prototype.set_content = function(new_content){
	this.content = new_content;
	this.need_render = true;
	if(this.content != null){
		if(this.content.get_width != undefined)
			this.rwidth = this.content.get_width();
		if(this.content.get_height != undefined)
			this.rheight = this.content.get_height();
	} else {
		this.rwidth = this.wwidth;
		this.rheight = this.rheight;
	}
}

