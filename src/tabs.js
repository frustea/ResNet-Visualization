
function TabSelector(element, selector, choices, style){
	this.element = element; 
	this.selector = selector; 
	this.choices = choices;
	this.style=style;

	this.element.innerHTML = this.html(); 
	this.tabs = this.element.getElementsByClassName('change');

	var self = this;
	var generator = function(i){	return function(){ self.on_click(i); };	}
	for(var i=0;i<this.tabs.length;i++)	this.tabs[i].onclick = generator(i);

	this.on_click(0);
}

TabSelector.prototype.html = function(){
	var width = document.getElementsByClassName('interaction')[0].clientWidth
	if (this.style=='none') {
		var content = "<div class='tab_words' id='tab_words' style='overflow-x:scroll;width: inherit; white-space:nowrap; overflow-y: hidden'>";
		for(var i=0;i<this.choices.length;i++)
			content += "<div class='change' style='font-size: 1.06rem; '>" + this.choices[i] + "</div>";
		content += "</div>";
		return content;
	}
	else {
		var content = "<div class='tab' style='position: relative;width:"+width+"px; left: 50%; transform: translate(-50%);'> <div class='fixed'>" + this.style + ": </div>";
		for(var i=0;i<this.choices.length;i++)
			content += "<div class='change' style='padding-right:2%; padding-left: 2%'>" + this.choices[i] + "</div>";
		content += "</div>";
		return content;
	}
}

TabSelector.prototype.on_click = function(i){
	this.tabs[i].classList.add('change2results');
	for(var j=0;j<this.tabs.length;j++)	if(i!=j)	if(this.tabs[j].classList.contains('change2results'))	
		this.tabs[j].classList.remove('change2results');
	this.selector.select(i);
}

function DownTabSelector(element, selector, choices){
	this.element = element; 
	this.selector = selector; 
	this.choices = choices; 

	this.element.innerHTML = this.html(); 
	this.tabs = this.element.getElementsByClassName('downchange');

	var self = this;
	var generator = function(i){	return function(){ self.on_click(i); };	}
	for(var i=0;i<this.tabs.length;i++)	this.tabs[i].onclick = generator(i);

	this.on_click(0);
}

DownTabSelector.prototype.html = function(){
	var content = "<div class='downtab'>";
	for(var i=0;i<this.choices.length;i++)
		content += "<div class='downchange' >" + this.choices[i] + "</div>";
	content += "</div>";
	return content;
}

DownTabSelector.prototype.on_click = function(i){
	this.tabs[i].classList.add('downchange2results');
	for(var j=0;j<this.tabs.length;j++)	if(i!=j)	if(this.tabs[j].classList.contains('downchange2results'))	
		this.tabs[j].classList.remove('downchange2results');
	this.selector.select(i);
}