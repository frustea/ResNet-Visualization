function JasperStructureContentViewer(scroll, scale){
	this.scroll = scroll;
	this.ctx = this.scroll.ctx ; 
	
	var net = get_network_layers(); 
	var net_size = net.length ;  
	this.n_block = [1];
	for(var i=1;i<net_size-2; i+=5)	this.n_block.push(5);
	this.n_block.push(1);
	this.n_block.push(1); 
	
	this.selected = -1;
	this.n_features = net;
	this.n_layers = net_size;

	this.layer_width = scale * 20; 
	this.layer_height = scale * 80 ; 
	
	this.outer_arrow = 3 * this.layer_width / 2;
	this.inner_arrow = this.outer_arrow / 3 ; 
	this.arrow_head = this.inner_arrow / 4;
	this.block_margin = this.inner_arrow; 

	this.layer_top = 2.5 * this.layer_height - this.block_margin;

	this.skip_bot_margin = this.inner_arrow; 
	this.skip_distance = (this.get_height() - this.layer_height - 2 * this.block_margin) / (this.n_block.length - 2); 
	this.skip_curve = this.inner_arrow;

 
	this.skip_maring = 3*this.arrow_head; 

	this.layers = [] ; 
	this.arrows = [] ;
	this.blocks = [] ; 
	this.skips = [] ;
	this.scroll.set_content(this); 
}

JasperStructureContentViewer.prototype.onmousemove = function(mouse_x, mouse_y){
	var cy1 = this.layer_top ;
	var cy2 = this.layer_top + this.layer_height;
	this.selected = -1; 
	if(mouse_y > cy2 || mouse_y < cy1 )	return; 

	var w = this.layer_width; 
	var cx = this.outer_arrow; 	
	var l = 0;

	for(var b=0;b<this.n_block.length;b++){
		for(var j=0;j<this.n_block[b];j++){
			if(cx <= mouse_x && mouse_x <= cx + w){
				this.selected = l; 
				return; 
			}
			cx += w + this.inner_arrow;
			if (this.n_block[b] -2 == j)	cx += this.inner_arrow;

			l += 1;
		}
		cx += this.outer_arrow - this.inner_arrow;
	}
}

JasperStructureContentViewer.prototype.draw = function(x, y, wwidth, wheight){
	this.draw_blocks(x, y, wwidth, wheight);
	this.draw_layers(x, y, wwidth, wheight);
	this.draw_connections(x, y, wwidth, wheight);
	this.ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
	this.ctx.fillRect(0, 0, wwidth, wheight);	

	if(this.selected != -1){
		this.draw_connections(x, y, wwidth, wheight, true);
		this.draw_layers(x, y, wwidth, wheight, true);
	}
}

JasperStructureContentViewer.prototype.draw_blocks = function(x, y, ww, wh){
	this.ctx.fillStyle = 'lightgray';
	var cx = this.outer_arrow - this.block_margin;
	var cy = this.layer_top - this.block_margin;
	var lw = this.layer_width + this.inner_arrow;
	var bw = this.block_margin * 2 ; 
	var h = this.layer_height + 2 * this.block_margin; 

	if(y - h <= cy && cy <= y + wh + h){
		for(var i=0;i<this.n_block.length;i++){
			var w = bw + (this.n_block[i] * lw);
			if(this.n_block[i] == 1)	w -= this.inner_arrow; 
			if(x - w <= cx && cx <= x + ww + w)	this.ctx.fillRect(cx - x, cy - y, w, h);
			cx += w + this.block_margin; 
		}
	}
}

JasperStructureContentViewer.prototype.draw_layers = function(x, y, ww, wh, only_selected=false){
	var h = this.layer_height; 
	var w = this.layer_width; 
	var r = w/2;
	var cx = this.outer_arrow - x; 
	var cy1 = this.layer_top + r - y;
	var cy2 = this.layer_top + h - r - y; 
	var cen_y = (cy1 + cy2) / 2; 
	var l = 0;

	if(0 <= cy2 && cy1 <= wh){
		for(var b=0;b<this.n_block.length;b++){
			for(var j=0;j<this.n_block[b];j++){
				if(0 <= cx + w && cx <= ww){
					if(!only_selected || l == this.selected){
						var cen_x = cx + r;
						var extra = 0;
						if(only_selected)	extra = 5;
						if(this.n_block[b] > 1 && j == this.n_block[b] - 1)	cen_x += this.inner_arrow;
						this.ctx.fillStyle = global_good_colors[b];
						this.ctx.beginPath();
						this.ctx.arc(cen_x, cy1 - extra, r + extra, 0, Math.PI, true);
						this.ctx.arc(cen_x, cy2 + extra, r + extra, Math.PI, 0, true);
						this.ctx.fill();

						this.ctx.fillStyle = 'white';
						this.ctx.textAlign = "center"; 
						this.ctx.textBaseline = "middle"; 
						this.ctx.fillText(this.n_features[l], cen_x, cen_y);
						this.ctx.fillText(l, cen_x, cy2);
					}
				}
				cx += w + this.inner_arrow;
				l += 1;
			}
			cx += this.outer_arrow - this.inner_arrow;
			if (this.n_block[b] > 1)	cx += this.inner_arrow;
		}
	}
}

JasperStructureContentViewer.prototype.draw_connections = function(x, y, ww, wh, only_selected=false){
	var color = 'black'; 
	var lineWidth = 1; 
	var white = 'white'; 
	if(only_selected){
		lineWidth = 2;
		color = global_good_colors[Math.floor((this.selected + 4)/ 5)]; 
		white = color;
		color = color; 
	}
	var cy = this.layer_top + this.layer_height/2 - y; 
	var r = this.skip_curve ;
	var l = 0 ; 

	if(0 <= cy && cy <= wh){
		//	Draw Forward Connections
		var cx = 0 - x; 
		for(var b=0;b<this.n_block.length;b++){
			for(var j=0;j<this.n_block[b];j++){
				var len = this.inner_arrow; 
				if(j == 0)	len = this.outer_arrow;
				else if (j == this.n_block[b] -1)	len = 2 * this.inner_arrow;
				if(0 <= cx + len && cx <= ww){
					if(!only_selected || (l == this.selected + 1)){
						this.ctx.beginPath();
						this.ctx.moveTo(cx, cy);
						this.ctx.lineTo(cx + len, cy); 
						this.draw_head(cx + len, cy, 'right');
						this.ctx.lineWidth = lineWidth * lineWidth;
						this.ctx.strokeStyle = white; 
						this.ctx.stroke();
						this.ctx.lineWidth = lineWidth;
						this.ctx.strokeStyle = color; 
						this.ctx.stroke();
					}
				}
				cx += len + this.layer_width;	
				l += 1;
			}
		}

		// Draw Skip Connections 
		var cx = this.outer_arrow + this.layer_width + this.outer_arrow / 2 - x;
		var small_step = this.outer_arrow / 2 + 4 * (this.layer_width + this.inner_arrow);
		var big_step = small_step + this.inner_arrow + this.outer_arrow /2 + this.layer_width;
		var up_y = this.skip_bot_margin;
		l = 0;
		for(var b=1; b<this.n_block.length;b++){
			if(this.n_block[b] > 1){
				if(! only_selected || l == this.selected){
					this.ctx.beginPath();
					// Up 
					if(0 <= cx + this.arrow_head && cx - this.arrow_head <= ww){
						this.ctx.moveTo(cx, cy); 
						this.ctx.lineTo(cx, up_y + r); 
						this.draw_head(cx, (cy + up_y + r)/2, 'up');
						this.draw_corner(cx, up_y + r, r, 'right');
					}
					var down_x = cx + small_step;
					for(var b2=b; b2 < this.n_block.length;b2++){
						if(this.n_block[b2] == 1)	break;
						// Right 
						var len = small_step - 2 * r;
						if(b2 != b)	len = big_step; 
						if(0 <= down_x + this.arrow_head && down_x - this.arrow_head - len <= ww){
							this.ctx.moveTo(down_x - len - r , up_y);
							this.ctx.lineTo(down_x - r, up_y);
							this.draw_head(down_x - len / 2 - r, up_y, 'right');
						}
						// Down
						if(0 <= down_x + this.arrow_head && down_x - this.arrow_head <= ww){
							this.draw_corner(down_x - r, up_y, r, 'down');
							this.ctx.moveTo(down_x, up_y + r);
							this.ctx.lineTo(down_x, cy);
							this.draw_head(down_x, cy, 'down');
						}
						down_x += big_step;
					}
					this.ctx.lineWidth = lineWidth * lineWidth;
					this.ctx.strokeStyle = white; 
					this.ctx.stroke();
					this.ctx.lineWidth = lineWidth;
					this.ctx.strokeStyle = color; 
					this.ctx.stroke();
				}
				up_y += this.skip_distance;
			}
			l += 5;
			cx += big_step;
		}
	}
}

JasperStructureContentViewer.prototype.draw_head = function(x, y, dir){
	// this.ctx.beginPath();
	if(dir == 'right'){
		this.ctx.moveTo(x - this.arrow_head, y - this.arrow_head);
		this.ctx.lineTo(x, y);
		this.ctx.lineTo(x - this.arrow_head, y + this.arrow_head);
	} else if (dir == 'up'){
		this.ctx.moveTo(x - this.arrow_head, y + this.arrow_head);
		this.ctx.lineTo(x, y);
		this.ctx.lineTo(x + this.arrow_head, y + this.arrow_head);
	} else {
		this.ctx.moveTo(x - this.arrow_head, y - this.arrow_head);
		this.ctx.lineTo(x, y);
		this.ctx.lineTo(x + this.arrow_head, y - this.arrow_head);
	}
}

JasperStructureContentViewer.prototype.draw_corner = function(x, y, r, dir){
	if( dir == 'right'){
		this.ctx.moveTo(x, y);
		this.ctx.arc(x + r, y, r, Math.PI, 3*Math.PI/2, false);
	}	else {
		this.ctx.moveTo(x, y);
		this.ctx.arc(x, y + r, r, 3*Math.PI/2, 0, false);
	}
}

JasperStructureContentViewer.prototype.get_width = function(){
	return this.n_layers * this.layer_width + this.n_block.length * (this.outer_arrow + this.inner_arrow) + (this.n_layers - this.n_block.length) * this.inner_arrow;
}

JasperStructureContentViewer.prototype.get_height = function(){
	return this.layer_top + this.layer_height + 2 * this.block_margin;
}

function JasperStructure(id, scale=1){
	this.vs = new VirtualScroll(id); 
	// this.vs.animate();
	this.content = new JasperStructureContentViewer(this.vs, scale);
}

function AutoScaleJasperStructure(id){
	this.vs = new VirtualScroll(id); 
	// this.vs.animate();
	var scale = 1;
	this.content = new JasperStructureContentViewer(this.vs, scale);
}

AutoScaleJasperStructure.prototype.draw = function(){
	this.vs.draw();
}