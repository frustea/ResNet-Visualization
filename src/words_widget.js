function ChartComplexDataProvider(words, activations, label, audio_folder){
    this.words = words; 
    this.activations = activations;
    this._label = label ;
    this.folder = audio_folder;
}

ChartComplexDataProvider.prototype.audio = function(l, f){    return base_url + this.folder +'/' + l + '_' + f + '.mp3' }
ChartComplexDataProvider.prototype.label = function(l, f){    return this._label + ' L: ' + l + '  F: ' + f;   }


function ChartComplex(element, data_provider){
    this.data = data_provider;
    this.element = element; 

    this.element.innerHTML = this.html(); 

    this.audio = this.element.getElementsByClassName('chart_complex_audio')[0];
    this.chart_canvas = this.element.getElementsByClassName('chart_complex_chart')[0];
    this.canvas = this.element.getElementsByClassName('chart_canvas')[0]; 
    this.dead_div = this.element.getElementsByClassName('dead_div')[0];

    //this.words = new ChartComplexWords(this, this.element.getElementsByClassName('chart_complex_words')[0]);
    this.chart = new Chart(this.canvas,{
        type:"bar",
        options:{ scales: {yAxes: [{ticks: {beginAtZero: true}}]}}
    });
}

ChartComplex.prototype.html = function(){
    var content = ''; 
    content += '<div class="chart_complex_chart" style="display:none; align-content: center;">';
    content += '<canvas class="chart_canvas" width="200" height="200"></canvas>';
    content += '</div>';
    content += '<audio controls class="chart_complex_audio" style="display:none; width: 302px">"<source src=""> Browser does not support this </source>"</audio>'; 
    content += '<div class="dead_div" style="display:none;"> Dead Neuron </div>';
    content += '<div class="flexible-div chart_complex_words" style="margin-top:2px; margin-bottom:16px; display: none;width: 266px; background-color: #F1F3F4; border-radius: 32px; padding: 14px 14px 14px 22px"></div>';
    return content;
}

ChartComplex.prototype.show_chart = function(words, activations, label, color="rgb(75, 192, 192)"){
    if (this.canvas.style.display === "none"){
        this.canvas.style.display = "block";
        this.audio.style.display = 'initial';
        this.dead_div.style.display = 'none';
    }
    this.chart.data = {
            labels: words,
            datasets:[{label: label, data:activations, backgroundColor: color}]
        };
    this.chart.update();
}


ChartComplex.prototype.dead = function(){
    if (this.canvas.style.display != "none"){
        this.canvas.style.display = "none";
        this.audio.style.display = 'none';
        this.dead_div.style.display = 'block';
    }
    // this.chart.data = {
    //         labels: words,
    //         datasets:[{label: label, data:activations, backgroundColor: color}]
    //     };
    // this.chart.update();
}


function found(arr, element){
    for(var i=0;i<arr.length;i++)
        if(arr[i] == element)   return true;
    return false; 
}

ChartComplex.prototype.update = function(l, f){
    this.chart_canvas.style.display='block'
    this.audio.style.display='initial'

    var playing = ! this.audio.paused;
    if(playing) this.audio.pause();

    if(!found(dead_data[l], f)){
    // if(found(dead_data[l], f)){
        //this.words.update(this.data.words[l][f]);
        this.show_chart(this.data.words[l][f], this.data.activations[l][f], this.data.label(l,f), global_good_colors[color_index.colors[l][f]]);
        this.audio.src = this.data.audio(l, f); ;
        if(playing) this.audio.play();
    } else {
        this.dead(); 
    }
}


/*function ChartComplexWords(parent, element){
    this.parent = parent;
    this.element = element;
    this.element.innerHTML = this.html();
    this.words_div = this.element.getElementsByClassName('words_div')[0];
    this.expand = this.element.getElementsByClassName('expand')[0];
    this.listeners();
}

ChartComplexWords.prototype.html = function(){
    var output = ''
    output += '<div style="display:flex; flex-direction:row; justify-content: space-between;">' ; 
    output += '<p style="margin:0">All words</p>'; 
    output += '<div class="expand"><p style="margin:0">+</p></div></div>';
    output += '<div class="words_div shownone "></div>';
    return output ; 
}

ChartComplexWords.prototype.update = function(words){
    var content = '';
    for(var i=0;i<words.length;i++)    content += "<span class='words'>" + words[i] + "</span>";
    this.words_div.innerHTML = content; 
    this.element.style.display='block'
}

ChartComplexWords.prototype.listeners = function(){
    var self = this; 
    this.expand.onclick = function(){
        if (self.words_div.classList.contains('shownone')){
            self.expand.innerHTML = '-';
            self.words_div.classList.remove('shownone');
            self.words_div.classList.add('show');
        } else {
            self.expand.innerHTML = '+';
            self.words_div.classList.remove('show');
            self.words_div.classList.add('shownone');
        }
    }
}*/

function ChartComplexShowCase(id, indices, data_provider){
    this.element = document.getElementById(id);
    this.indices = indices; 
    this.data = data_provider;

    this.element.innerHTML = this.html();
    this.chart = new ChartComplex(this.element.getElementsByClassName('chart_complex_div')[0], data_provider);

    var tabs = [];
    for(var i=0;i<indices.length;i++)   tabs.push((i+1));
    this.tabs = new TabSelector(this.element.getElementsByClassName('tab_div')[0], this, tabs, 'Example'); 
}

function ChartComplexShowCaseDeep(id, indices, data_provider, costum_tab){
    this.element = document.getElementById(id);
    this.indices = indices; 
    this.data = data_provider;

    this.element.innerHTML = this.html();
    this.chart = new ChartComplex(this.element.getElementsByClassName('chart_complex_div')[0], data_provider);

    var tabs = costum_tab;
    // for(var i=0;i<indices.length;i++)   tabs.push((i+1));
    this.tabs = new TabSelector(this.element.getElementsByClassName('tab_div')[0], this, tabs, 'Phoneme Combination'); 
}

ChartComplexShowCaseDeep.prototype = Object.create(ChartComplexShowCase.prototype);
Object.defineProperty(ChartComplexShowCaseDeep.prototype, 'constructor', {value: ChartComplexShowCase,  enumerable: false, writable: true });

ChartComplexShowCase.prototype.select = function(i){
    var l = this.indices[i][0];
    var f = this.indices[i][1];
    this.chart.update(l, f);
}

ChartComplexShowCase.prototype.html = function(){
    var content = '';
    content += '<div class="tab_div"></div>';
    content += '<div style="display: flex;justify-content: center;align-items: center;"> <div class="chart_complex_div"> </div> </div>';
    return content;
}