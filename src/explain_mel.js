function MelViewer(element, data){
    element.innerHTML = this.html();
    this.data = data; 
    this.tab_div = element.getElementsByClassName('tab_div')[0];
    this.canvas = element.getElementsByClassName('mel_viewer_canvas')[0];
    this.audio = element.getElementsByClassName('audio_player')[0];

    this.ctx = this.canvas.getContext('2d');
    this.ctx.canvas.width = element.offsetWidth;
    this.h_per = 100 ; 
    this.margin = 10 ; 

    this.ctx.canvas.height = 4 * this.h_per + this.margin;
    this.w = this.ctx.canvas.width;
    this.h = this.ctx.canvas.height;


    this.phoneme = new PhonemeCanvas(this.ctx, 0, 0, this.w, this.h_per, this.margin)
    this.wav = new MelWave(this.ctx, 0, this.h_per, this.w, this.h_per, this.margin);
    this.spec = new SpecCanvas(this.ctx, 0, 2*this.h_per, this.w, this.h_per, this.margin);
    this.mel = new MelMelCanvas(this.ctx, 0, 3*this.h_per, this.w, this.h_per, this.margin);

    this.drawer = [];
    this.drawer.push(this.wav);
    this.drawer.push(this.spec);
    this.drawer.push(this.mel);
    this.drawer.push(this.phoneme);

    this.need_render = true; 
    this.vcart = true; 

    var words = [] ; 
    for(var i=0;i<data.length;i++)   words.push(data[i]['word']);
    this.tabs =  new TabSelector(this.tab_div, this, words, 'none');
}

MelViewer.prototype.clean = function(){
    this.ctx.fillStyle = 'white';
    this.ctx.fillRect(0, 0, this.w, this.h);
}

MelViewer.prototype.draw = function(){
    var cur_percent = this.get_percent();
    if(cur_percent != this.last_percent){
        this.last_percent = cur_percent;
        this.need_render = true;
    }
    if(this.need_render){
        this.clean();
        for(var i=0;i<this.drawer.length;i++)   this.drawer[i].draw(cur_percent);
        
        this.draw_curser(cur_percent);
        this.draw_labels();
        this.need_render = false; 
    }
}

MelViewer.prototype.draw_labels = function(){
    this.ctx.fillStyle = 'gray';
    this.ctx.font = '12px arial';
    this.ctx.textBaseline = 'middle';
    this.ctx.textAlign = 'center'; 
    this.ctx.fillText('Time', this.w / 2, this.h - this.margin);

    this.ctx.rotate(-Math.PI/2);
    this.ctx.fillText('Amplitude', -(this.h_per/2 +  this.h_per), this.margin) ;
    this.ctx.fillText('Frequency', -(this.h_per/2 +  2*this.h_per), this.margin) ;
    this.ctx.fillText('Frequency', -(this.h_per/2 +  3*this.h_per), this.margin) ;
    this.ctx.rotate(+Math.PI/2);

    this.ctx.fillStyle = 'black';
    this.ctx.rotate(-Math.PI/2);
    this.ctx.fillText('Phonemes', -(this.h_per/2), this.w - this.margin) ;
    this.ctx.fillText('WaveForm', -(this.h_per/2 +  this.h_per), this.w - this.margin) ;
    this.ctx.fillText('Spectrogram', -(this.h_per/2 +  2*this.h_per), this.w - this.margin) ;
    this.ctx.fillText('Mel-Spectrogram', -(this.h_per/2 +  3*this.h_per), this.w - this.margin) ;
    this.ctx.rotate(+Math.PI/2);

}

MelViewer.prototype.draw_curser = function(p){
    var cx = 3 * this.margin + p * (this.w - 6* this.margin) ; 
    this.ctx.beginPath();
    this.ctx.strokeStyle = global_good_colors[6];
    this.ctx.moveTo(cx, 0);
    this.ctx.lineTo(cx, this.h);
    this.ctx.stroke();
}

MelViewer.prototype.get_percent = function(){
    if(!Number.isNaN(this.audio.duration))  return this.audio.currentTime / this.audio.duration;
    return -1;
}

MelViewer.prototype.html = function(){
    var content = ""; 
    content += "<div class='tab_div'></div>"; 
    content += "<div class='content_div'>";
    content += "    <canvas class='mel_viewer_canvas'> </canvas>";
    content += "    <audio controls autoplay class='audio_player' style='display:none;'>'<source class='audio_src' src='' type='audio/wav'> Your browser does not support this audio'; </audio> " ;
    content += "</div>"
    return content; 
}

MelViewer.prototype.select = function(i){
    var data = this.data[i];
    this.wav.set_data(data['wav']);
    this.spec.set_data(data['spec']);
    this.mel.set_data(data['mel']);
    this.phoneme.set_data(data['phonemes']);

    this.audio.src = 'https://storage.googleapis.com/audiozation/explain_mel/' + i + '.mp3' ;
    this.audio.playbackRate = .6;
    if(!this.vcart) this.audio.play();
    this.vcart = false; 

    this.last_percent = -1; 
    this.need_render = true;
}

function MelCanvas (ctx, x, y, w, h, margin){
    this.ctx = ctx;
    this.x = x; 
    this.y = y; 
    this.w = w; 
    this.h = h; 
    this.margin = margin; 
}

MelCanvas.prototype.set_data = function(data){
    this.data = data; 
    this.max_x = 1;
    this.min_x = 0; 
    this.max_y = 1; 
    this.min_y = 0;
}

MelCanvas.prototype.draw = function(percent){
    this.ctx.strokeStyle = 'black'; 
    this.ctx.beginPath();
    this.ctx.rect(this.get_x(0), this.get_y(0), this.get_x(this.max_x) - this.get_x(this.min_x), this.get_y(this.max_y) - this.get_y(this.min_y)); 
    this.ctx.stroke();
}

MelCanvas.prototype.get_x = function(tx){
    return this.x + 3 * this.margin + (tx - this.min_x) * (this.w - 6 * this.margin) / (this.max_x - this.min_x);
}

MelCanvas.prototype.get_y = function(ty){
    return this.y + this.margin + (this.max_y - ty) * (this.h - 2 * this.margin) / (this.max_y - this.min_y);
}

MelCanvas.prototype.get_p = function(v){
    return (v - this.min_x) / (this.max_x - this.min_x);
}

MelCanvas.prototype.rev_p = function(percent){
    return percent * (this.max_x - this.min_x) + this.min_x;
}

function PhonemeCanvas(ctx, x, y, w, h, margin){
    MelCanvas.call(this, ctx, x, y, w, h, margin);
    this.color = global_good_colors[6];
    this.other_color = 'white';
    this.damp_color = 'lightgray';
}

PhonemeCanvas.prototype = Object.create(MelCanvas.prototype);
Object.defineProperty(PhonemeCanvas.prototype, 'constructor', {value: MelCanvas,  enumerable: false, writable: true });

PhonemeCanvas.prototype.set_data = function(data){
    this.data = data ; 
    this.min_x = data[0][0]; 
    this.max_x = data[data.length-1][1];

    this.min_y = 0; 
    this.max_y = 1;
}


PhonemeCanvas.prototype.draw = function(percent){
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = "middle";
    this.ctx.font = '18px arial';
    var h = this.get_y(1) - this.get_y(0);

    for(var i=0;i<this.data.length;i++){
        var p1 = this.get_p(this.data[i][0]);
        var p2 = this.get_p(this.data[i][1]);

        if(percent < p1){
            if(i&1) this.ctx.fillStyle = this.damp_color;
            else    this.ctx.fillStyle = this.other_color;
            this.ctx.fillRect(this.get_x(this.data[i][0]), this.get_y(0), 
            this.get_x(this.data[i][1]) - this.get_x(this.data[i][0]), h);
        } else if (p2 < percent){
            if(i&1) this.ctx.fillStyle = this.color;
            else    this.ctx.fillStyle = this.other_color;
            this.ctx.fillRect(this.get_x(this.data[i][0]), this.get_y(0), 
            this.get_x(this.data[i][1]) - this.get_x(this.data[i][0]), h);
        } else {
            if(i&1) this.ctx.fillStyle = this.color;
            else    this.ctx.fillStyle = this.other_color;
            var mid = percent * (this.max_x - this.min_x) + this.min_x;
            this.ctx.fillRect(this.get_x(this.data[i][0]), this.get_y(0), 
                this.get_x(mid) - this.get_x(this.data[i][0]), h);
            if(i&1) this.ctx.fillStyle = this.damp_color;
            else    this.ctx.fillStyle = this.other_color;
            this.ctx.fillRect(this.get_x(mid), this.get_y(0), 
                this.get_x(this.data[i][1]) - this.get_x(mid), h);
        }

        // this.ctx.fillRect(this.get_x(this.data[i][0]), this.get_y(0), 
            // this.get_x(this.data[i][1]) - this.get_x(this.data[i][0]), h);

        // if(percent < p1){
        //     if(i&1) this.ctx.fillStyle = this.other_color;
        //     else this.ctx.fillStyle = this.damp_color;
        // } else if (percent > p2){
        //     if(i&1) this.ctx.fillStyle = this.other_color;
        //     else this.ctx.fillStyle = this.color;
        // } else {
        //     this.ctx.fillStyle = this.other_color;
        // }
        this.ctx.fillStyle = 'black';
        this.ctx.fillText(this.data[i][2], 
            (this.get_x(this.data[i][0]) + this.get_x(this.data[i][1]))/2, 
            (this.get_y(0) + this.get_y(1)) /2 );
        this.ctx.stroke();
    }
}

function MelWave(ctx, x, y, w, h, margin){
    MelCanvas.call(this, ctx, x, y, w, h, margin);
    this.color = global_good_colors[0];
    this.damp_color = 'lightgray';
}

MelWave.prototype = Object.create(MelCanvas.prototype);
Object.defineProperty(MelWave.prototype, 'constructor', {value: MelCanvas,  enumerable: false, writable: true });

MelWave.prototype.draw = function(percent){
    this.ctx.strokeStyle = 'black'; 
    this.ctx.beginPath();
    this.ctx.rect(this.get_x(0), this.get_y(this.min_y), this.get_x(this.max_x) - this.get_x(this.min_x), this.get_y(this.max_y) - this.get_y(this.min_y)); 
    this.ctx.stroke();

    this.ctx.strokeStyle = this.color;
    this.ctx.beginPath();
    this.ctx.moveTo(this.get_x(0), this.get_y(this.data[0]));
    var vcart = true; 
    for(var i=0;i<this.data.length;i++) {
        this.ctx.lineTo(this.get_x(i), this.get_y(this.data[i]));
        if(vcart && this.get_p(i) > percent){
            vcart = true; 
            this.ctx.stroke();
            this.ctx.strokeStyle = this.damp_color; 
            this.ctx.beginPath();
            this.ctx.moveTo(this.get_x(i), this.get_y(this.data[i]));
        }
    }
    this.ctx.stroke();
}

MelWave.prototype.set_data = function(data){
    this.data = data ; 
    this.min_y = -1; 
    this.max_y = 1;
    var mx = this.data[0];
    for(var i=0;i<this.data.length;i++){
        if(Math.abs(this.data[i]) > mx)   mx = Math.abs(this.data[i]);
    }
    this.max_y = mx; 
    this.min_y = -mx;
    this.min_x = 0; 
    this.max_x = this.data.length;
}

function SpecCanvas(ctx, x, y, w, h, margin){
    MelCanvas.call(this, ctx, x, y, w, h, margin);
    this.color = global_good_colors[15];
    this.other_color = 'black';
    // this.damp_color = 'gray';
}

SpecCanvas.prototype = Object.create(MelCanvas.prototype);
Object.defineProperty(SpecCanvas.prototype, 'constructor', {value: MelCanvas,  enumerable: false, writable: true });

SpecCanvas.prototype.set_data = function(data){
    this.data = data ; 
    this.min_y = 0; 
    this.min_x = 0; 
    this.max_x = this.data[0].length;
    this.max_y = this.data.length; 

    var mx = this.data[0][0]; 
    var mn = this.data[0][0];
    for(var i=0;i<this.data.length;i++)
        for(var j=0;j<this.data[i].length;j++)
            if(mx < this.data[i][j])    mx = this.data[i][j];

    console.log('mx is' + mx);

    for(var i=0;i<this.data.length;i++)
        for(var j=0;j<this.data[i].length;j++)
            this.data[i][j] = this.data[i][j] / mx;
}

SpecCanvas.prototype.draw = function(percent){
    this.ctx.fillStyle = this.color;
    this.ctx.beginPath();
    this.ctx.fillRect(this.get_x(this.min_x), this.get_y(this.min_y), 
        this.get_x(this.max_x) - this.get_x(this.min_x), 
        this.get_y(this.max_y) - this.get_y(this.min_y)); 

    this.ctx.fillStyle = this.other_color;
    var mx = -1; 
    for(var x=0;x<this.max_x;x++)
        for(var y=0;y<this.max_y;y++){
            if(mx < this.data[y][x]) mx = this.data[y][x];
            this.ctx.beginPath();
            this.ctx.globalAlpha = this.data[y][x];
            this.ctx.fillRect(this.get_x(x), this.get_y(y), this.get_x(x+1) - this.get_x(x), this.get_y(y+1) - this.get_y(y));
        }

    this.ctx.globalAlpha = 0.9;
    this.ctx.fillStyle = 'white';
    // this.ctx.fillStyle = this.other_color; 
    var lp = this.get_x(this.rev_p(percent)); 
    this.ctx.fillRect(lp, this.get_y(this.min_y), this.get_x(this.max_x) - lp, 
        this.get_y(this.max_y) - this.get_y(this.min_y)); 

    this.ctx.globalAlpha = 1.;

    this.ctx.strokeStyle = this.color;
    this.ctx.rect(this.get_x(this.min_x), this.get_y(this.min_y), 
        this.get_x(this.max_x) - this.get_x(this.min_x), 
        this.get_y(this.max_y) - this.get_y(this.min_y)); 
    this.ctx.stroke();
}

function MelMelCanvas(ctx, x, y, w, h, margin){
    SpecCanvas.call(this, ctx, x, y, w, h, margin);
    this.color = global_good_colors[30];
    this.other_color = global_good_colors[2];
    // this.damp_color = 'gray';
}

MelMelCanvas.prototype = Object.create(SpecCanvas.prototype);
Object.defineProperty(MelMelCanvas.prototype, 'constructor', {value: SpecCanvas,  enumerable: false, writable: true });