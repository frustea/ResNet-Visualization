function Drawer(){
  this.drawables = [] ; 
  this.animation_id = -1; 
  this.animate();
}

Drawer.prototype.animate = function(){
  this.animation_id = window.requestAnimationFrame(this.animate.bind(this));
  this.draw();
}

Drawer.prototype.draw = function(){
  for(var i=0;i<this.drawables.length;i++)  this.drawables[i].draw();
}

Drawer.prototype.add = function(drawable){  this.drawables.push(drawable);  }