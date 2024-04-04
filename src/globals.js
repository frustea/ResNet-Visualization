// var global_good_colors = ["3366cc","dc3912","ff9900","109618","990099","0099c6","dd4477","66aa00","b82e2e",
// "316395","3366cc","994499","22aa99","aaaa11","6633cc","e67300","8b0707","651067","329262","5574a6","3b3eac",
// "b77322","16d620","b91383","f4359e","9c5935","a9c413","2a778d","668d1c","bea413","0c5922","743411"];
//var global_good_colors = ["#3366cc","#dc3912","#ff9900","#109618","#990099","#0099c6","#dd4477","#66aa00","#b82e2e",
//"#316395","#3366cc","#994499","#22aa99","#aaaa11","#6633cc","#e67300","#8b0707","#651067","#329262","#5574a6","#3b3eac",
//"#b77322","#16d620","#b91383","#f4359e","#9c5935","#a9c413","#2a778d","#668d1c","#bea413","#0c5922","#743411"];

var global_good_colors = [];

function hexCode(i) {
    return ("0" + parseInt(i).toString(16)).slice(-2);
}

//
//function convert_rgb(rgb) {
//    rgb = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
//    console.log(rgb);
//
//
//    return "#" + hexCode(rgb[1]) + hexCode(rgb[2])
//            + hexCode(rgb[3]);
//}

function gen_activation_color(activation){
//28, 38, 186 Dark blue
//163, 165, 196 Light blue
// 192, 55, 219 Pink
    return '#' + hexCode(28 * activation + 192 * (1-activation)) +
                 hexCode(38 * activation + 55 * (1-activation))  +
                 hexCode(186 * activation + 219 * (1 - activation)) ;
}

function GlobalColorProvider(){
	this.layers = get_network_layers();
	this.colors = [] ;
	for(var i=0;i<this.layers.length;i++){
		var temp = [];
		for(var j=0;j<this.layers[i];j++)	{
		    global_good_colors.push(gen_activation_color(feature_colors[i][j]))
		    temp.push(global_good_colors.length);
//            temp.push(global_good_colors[0])
		}
		this.colors.push(temp);
	}
    console.log(this.colors);
    console.log(global_good_colors);

}

var color_index = new GlobalColorProvider();

var base_url = 'https://storage.googleapis.com/audiozation/audios/';
var base_js_url = 'https://storage.googleapis.com/audiozation/js/';

function get_network_layers(){
  return layers;
}

function get_unit(max_val){
	var lg = Math.floor(Math.log10(max_val / 2));
	var unit = Math.pow(10, lg);
	// if(max_val / unit < 5)	unit = unit / 2;
	if(max_val / unit > 5)	unit = unit * 2;
	return unit;
}

function print_unit(val){
	return Math.round((val + Number.EPSILON) * 100) / 100;
}

function get_max(arr){
	if(Array.isArray(arr)) {
		var ret = get_max(arr[0]); 
		for(var i=1;i<arr.length;i++){
			var c=get_max(arr[i]);
			if(c > ret) ret = c;
		}
		return ret;
	} 
	if (arr.constructor == Object){
		var ret = get_max(arr[Object.keys(arr)[0]]); 
		for(var i in arr){
			var c=get_max(arr[i]);
			if(c > ret) ret = c;
		}
		return ret;
	}
	return arr;
}


function getTouch(event){
	if ('clientX' in event && 'clientY' in event){
		function temp(event){
			this.x = event.clientX;
			this.y = event.clientY;
		}
		return new temp(event); 
	} else {
		function temp(event){
			this.x = event.pageX ; 
			this.y = event.pageY ; 
		}
		return new temp(event);
	}
}

function isInViewport(element) {
    const rect = element.getBoundingClientRect();
    var bound = Math.max(window.innerHeight, document.documentElement.clientHeight);
    return (0 <= rect.top  && rect.top <= bound) || (0 <= rect.bottom && rect.bottom <= bound);
}
