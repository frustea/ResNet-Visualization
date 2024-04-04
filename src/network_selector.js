function WholeNetworkFeatureViewer(parent, margin, i, l){
  this.parent = parent; 
  this.ctx = this.parent.ctx;

  this.margin = margin; 
  this.i = i; 
  this.l = l;
  
  this.color = global_good_colors[color_index.colors[l-1][i-1]];
}

WholeNetworkFeatureViewer.prototype.draw = function(x, y, r, w, h){
  if(0 <= y + 2*r + this.margin  && y - r - this.margin <= h){
    this.ctx.fillStyle = this.color; 
    this.ctx.beginPath();
    this.ctx.arc(x, y+ this.margin + r, r, 0, 2*Math.PI, false);
    this.ctx.fill();
  }
}

WholeNetworkFeatureViewer.prototype.draw_text = function(x, y, r){
    this.ctx.fillStyle = 'black';
    this.ctx.textAlign = "center"; 
    this.ctx.textBaseline = "middle"; 
    this.ctx.fillText(this.i - 1, x, y + this.margin + r);
}

function WholeNetworkLayerViewer(parent, r, scaleUp, n, margin, i){
  this.parent = parent; 
  this.ctx = this.parent.ctx;
  this.x = 0;
  this.y = 0;
  this.w = 2 * r + 2 * margin; 
  this.margin = margin; 
  this.n = n;
  this.r = r ;
  this.scaleUp = (scaleUp * (this.margin + this.r) - this.margin) / this.r;
  this.selected = false; 
  this.i = i; 

  this.features = []; 
  for(var i=0;i<n;i++)  this.features.push(new WholeNetworkFeatureViewer(this.parent, this.margin, i+1, this.i));
}


WholeNetworkLayerViewer.prototype.draw = function(x, yp, w, h, scale){
  if(0 <= x + this.w * scale  && x <= w) {
    this.x = x; 
    this.selected = (scale > 1);
    this.y = h/2 - yp * this.get_h(this.selected); 
    if (scale > 1)  this.parent.selected_feature = Math.floor(yp * this.features.length * 0.9999999); 
    this.draw_back(scale);

    var last_y = 0; 
    var center = this.x + (this.w * scale) / 2 ; 
    for(var i=0;i<this.features.length;i++) {
      var cscale = (i == this.parent.selected_feature && this.selected) ? this.scaleUp : 1; 
      this.features[i].draw(center, this.y + last_y, this.r * cscale, w, h);
      if (cscale > 1)  this.features[i].draw_text(center, this.y + last_y, this.r * cscale);
      last_y += 2 * this.r * cscale + this.margin;
    }

    this.draw_index(scale);
  }
}

WholeNetworkLayerViewer.prototype.draw_back = function(scale){
  this.ctx.beginPath();
  // this.ctx.fillStyle = 'lightgray';
  this.ctx.fillStyle = 'rgb(240, 240, 250)';
  var w = this.w * scale; 
  this.ctx.rect(this.x, this.y + w / 2 , w, this.get_h(this.selected) - w);
  this.ctx.arc(this.x + w/2, this.y + w /2 , w/2, Math.PI, 0, false);
  this.ctx.arc(this.x + w/2, this.y + this.get_h(this.selected) - w/2 , w/2, 0, Math.PI, false);
  this.ctx.fill();
}

WholeNetworkLayerViewer.prototype.draw_index = function(scale){
  var w = this.w * scale; 
  this.ctx.beginPath();
  this.ctx.fillStyle = 'rgba(211, 211, 250, 0.8)';
  var cy = Math.max(this.y - 4 * this.margin, this.margin);
  var r = 3* this.margin / 2;
  if (w <= 3* this.margin + 1){
      this.ctx.arc(this.x + r, cy + r, r, 0, 2*Math.PI, false);
  } else {
      this.ctx.arc(this.x + r, cy + r, r, Math.PI/2, -Math.PI/2, false);
      this.ctx.arc(this.x + w - r, cy + r, r, -Math.PI/2, Math.PI/2, false);
      this.ctx.rect(this.x + r, cy, w - 2*r, 3*this.margin);
  }
  
  this.ctx.fill();

  this.ctx.fillStyle = 'black';
  this.ctx.textAlign = "center"; 
  this.ctx.textBaseline = "middle"; 
  this.ctx.fillText(this.i-1, this.x + w/2, cy + r);
}

WholeNetworkLayerViewer.prototype.get_h = function(selected){
  if( selected ) return (this.n+1) * this.margin + (this.n-1) * 2 * this.r + this.scaleUp * (2 * this.r);
  else  return (this.n+1) * this.margin + this.n * 2 * this.r;
}

function WholeNetworkContentViewer(scroll, scale=1){
  this.scroll = scroll; 
  this.ctx = this.scroll.ctx;

  this.network = get_network_layers();
  this.network.pop();


  this.layer_w = 30 * scale; 
  this.margin = 10 * scale; 
  this.scaleUp = 2; 

  this.sides = this.scroll.wwidth / 2 ; 

  this.selected_layer = -1; 
  this.selected_feature = -1; 
  this.r = (this.layer_w - 2*this.margin) / 2;

  this.layers = [] ; 

  for(var i=0;i<this.network.length;i++) 
    this.layers.push(new WholeNetworkLayerViewer(this, this.r, this.scaleUp, this.network[i], this.margin, i+1));

  this.scroll.set_content(this);
  this.selected = null; 
}

WholeNetworkContentViewer.prototype.set_selected = function(selected){
  this.selected = selected; 
}

WholeNetworkContentViewer.prototype.draw = function(x, y, w, h){

  var yp = y / (this.get_height() - h);
  var xp = x / (this.get_width() - w);
  this.selected_layer = Math.floor(xp * this.layers.length * 0.99999); 
  var tx = w / 2 - xp*this.get_width();
  
  var last_x = 0; 
  for(var i=0;i<this.layers.length;i++) {
    var scale = (i == this.selected_layer)? this.scaleUp : 1; 
    this.layers[i].draw(last_x + tx, yp, w, h, scale);
    last_x += this.layer_w * scale + this.margin; 
  }
  // this.draw_center(w, h);

  var grd = this.ctx.createLinearGradient(0, 0, 0, 30);
  grd.addColorStop(0,'rgba(255, 255, 255, 1)');
  grd.addColorStop(1,'rgba(255, 255, 255, 0)');
  this.ctx.fillStyle = grd;
  this.ctx.fillRect(0, 0, this.ctx.canvas.width, 30);

  grd = this.ctx.createLinearGradient(0, this.ctx.canvas.height - 30, 0, this.ctx.canvas.height);
  grd.addColorStop(0,'rgba(255, 255, 255, 0)');
  grd.addColorStop(1,'rgba(255, 255, 255, 1)');
  this.ctx.fillStyle = grd;
  this.ctx.fillRect(0, this.ctx.canvas.height - 30, this.ctx.canvas.width, this.ctx.canvas.height);

  grd = this.ctx.createLinearGradient(0, 0, 30, 0);
  grd.addColorStop(0,'rgba(255, 255, 255, 1)');
  grd.addColorStop(1,'rgba(255, 255, 255, 0)');
  this.ctx.fillStyle = grd;
  this.ctx.fillRect(0, 0, 30, this.ctx.canvas.height);


  grd = this.ctx.createLinearGradient(this.ctx.canvas.width -30, 0, this.ctx.canvas.width, 0);
  grd.addColorStop(0,'rgba(255, 255, 255, 0)');
  grd.addColorStop(1,'rgba(255, 255, 255, 1)');
  this.ctx.fillStyle = grd;
  this.ctx.fillRect(this.ctx.canvas.width-30, 0, this.ctx.canvas.width, this.ctx.canvas.height);

  if(this.selected != null) this.selected.select(this.selected_layer, this.selected_feature);
}

WholeNetworkContentViewer.prototype.draw_center = function(w, h){
  this.ctx.beginPath();
  this.ctx.fillStyle = 'green';
  this.ctx.rect(w/2 -1, h/2 -1 , 2, 2);
  this.ctx.fill();
}

WholeNetworkContentViewer.prototype.get_width = function(){
  return (this.network.length - 1) * (this.layer_w + this.margin) + this.layer_w * this.scaleUp; 
}

WholeNetworkContentViewer.prototype.get_height = function(){
  return this.margin * 2 + this.layers[this.layers.length - 1].get_h(true);
}

function WholeNetworkSelectedContentViewer(selector){
  this.selector = selector ; 
  this.selected_feature = -1; 
  this.selected_layer = -1;

  this.viewed_feature = -1; 
  this.viewed_layer = -1; 
  this.listeners = []; 

  this.selector.set_selected(this);
  this.select(0, 0);
}

WholeNetworkSelectedContentViewer.prototype.select = function(l, f){
  if(this.viewed_layer == l && this.viewed_feature == f) return; 
  if(this.selected_layer == l && this.viewed_feature == f) return; 
  this.selected_feature = f; 
  this.selected_layer = l; 
  var self = this; 
  setTimeout(function (){
    if(self.selected_feature == f && self.selected_layer == l)  self.update();
  }, 500); 
}

WholeNetworkSelectedContentViewer.prototype.update = function(){
  if(this.selected_layer == this.viewed_layer && this.selected_feature == this.viewed_feature)  return; 
  this.viewed_feature = this.selected_feature;
  this.viewed_layer = this.selected_layer;
  for(var i=0;i<this.listeners.length;i++)  this.listeners[i].update(this.viewed_layer, this.viewed_feature);
}

WholeNetworkSelectedContentViewer.prototype.add_listener = function(listener){
  this.listeners.push(listener);
}

function WholeNetworkSelector(id, listeners, scale=1){
  this.vs = new VirtualScroll(id); 
  // this.vs.animate();
  this.content = new WholeNetworkContentViewer(this.vs, scale); 
  this.selected = new WholeNetworkSelectedContentViewer(this.content);      
  for(var i=0;i<listeners.length;i++)  this.selected.add_listener(listeners[i]);
}

function WholeNetworkSelectorAutoScale(id, listeners){
  this.vs = new VirtualScroll(id); 
  // this.vs.animate();
  var scale = this.vs.wheight  / 400 ;
  this.content = new WholeNetworkContentViewer(this.vs, scale); 
  this.selected = new WholeNetworkSelectedContentViewer(this.content);      
  for(var i=0;i<listeners.length;i++)  this.selected.add_listener(listeners[i]);
}

function WholeNetworkWidget(id){
  this. listeners = [new ImageViewer(document.getElementById("selected_image"))] ;
  this.selector = new WholeNetworkSelectorAutoScale(id, this.listeners);
}

WholeNetworkWidget.prototype.draw = function(){
  this.selector.vs.draw();
}



function ImageViewer(element){
    this.element = element;
    this.layer = 0 ;
    this.feature = 0;
    this.element.innerHTML = this.html();
}

ImageViewer.prototype.html = function(){
    var content = '';
//    content += '<table style="height: 500px"> <tr> <td rowspan="3"> ';
//    content += '<img style="width:400px; margin:auto;"  src="index/' + this.layer + '_' + this.feature + '.png">';
//    content += '</td> <th> Layer </th> <td> ' + this.layer + ' </td> </tr>  ' ;
//    content += '<tr> <th> Layer Type </th> <td> ' + layer_names[this.layer] + '</td> </tr> ';
//    content += '<tr> <th> Feature </th> <td> ' + this.feature + '</td> </tr> </table>'

    content += '<table style="height: 500px; text-align: center; margin:auto" > <tr> <td> ';
    content += '<img style="width:250px; margin:auto;"  src="index/' + this.layer + '_' + this.feature + '.png">';
    content += '</td> <td>';

    content += '<table> <tr> '
    content += '<th> Layer </th> <td> ' + this.layer + ' </td> </tr>  ' ;
    content += '<tr> <th> Layer Type </th> <td> ' + layer_names[this.layer] + '</td> </tr> ';
    content += '<tr> <th> Feature </th> <td> ' + this.feature + '</td> </tr> </table>'

    content += '</td> <tr> </table>';

    return content;
}

ImageViewer.prototype.update = function(layer, feature){
//    alert('Selected ' + layer + ' ' + feature);
    this.layer = layer;
    this.feature = feature;
    this.element.innerHTML = this.html();
}


ImageViewer.prototype.dead = function(){}