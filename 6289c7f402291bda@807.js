// https://observablehq.com/@karimdouieb/football-wind@807
function _1(md){return(
    md`# Football Wind ⚽️💨
    
    A wind map visualisation of a typical football game. Each particle is following a force field built from the aggregation of 882,536 passes from 890 matches played in various major leagues/cups (Champion League 1999, FA Women’s Super League 2018, FIFA World Cup 2018, La Liga 2004 – 2020, NWSL 2018, Premier League 2003 – 2004, Women’s World Cup 2019).
    Data Source: [StatsBomb](https://github.com/statsbomb/open-data)
    
    The force field is defined at every square meter on the terrain, the force direction corresponds to the average angle of the passes originating from the corresponding square meter and the force intensity is proportional to the average distance of the passes: the longer the pass, the greater the force. 
    
    I kind of like the visual in the way that it resemble rain pouring on a terrain eroded by almost a million passes. 
    
    FYI I've also created a [3D interactive visual](https://observablehq.com/@karimdouieb/all-the-passes) showing every single passe used to build this football wind visual. `
    )}
    
    function _2(d3,width,height,drawField,createParticles,createLegend)
    {
        var div = d3.create("div")
          .style("width", `${width}px`)
          .style("height", `${height*1.2}px`)
          .style("background-color", "#2c2c2c");
    
        var canvasMap = div.append("canvas")
          .attr("id", "canvas-map")
          .attr("width", width)
          .attr("height", height)
          .style("position", "absolute")
          .style("top", `${height*0.13}px`);
      
        div.append("canvas")
           .attr("id", "canvas-wind")
           .attr("width", width)
           .attr("height", height)
           .style("position", "absolute")
           .style("top", `${height*0.13}px`);
    
        let overlay = div.append("div")
           .attr("class", "overlay")
           .attr("width", width)
           .attr("height", height*1.2)
           .style("position", "absolute");
    
        drawField(canvasMap.node());
        createParticles();
        createLegend(overlay, width, height*1.2);
      
        return div.node();
    }
    
    
    function _factor(Inputs){return(
    Inputs.range([0, 0.1], {label: "Factor", step: 0.001, value: 0.04})
    )}
    
    function _maxSpeed(Inputs){return(
    Inputs.range([1, 10], {label: "maxSpeed", step: 0.01, value: 1})
    )}
    
    function _lineWidth(Inputs){return(
    Inputs.range([0, 2], {label: "Line Width", step: 0.01, value: 0.2})
    )}
    
    function _MAX_PARTICLE_LIFE(){return(
    80
    )}
    
    function _MAX_PARTICLE_CNT(){return(
    10000
    )}
    
    function* _8(d3,lineWidth,updateParticles,particles,width,scale,height,fieldWidth)
    {
        while(true){
            var canvas = d3.select("canvas#canvas-wind");
            if(!canvas.empty()){
                canvas = canvas.node();
              
                  var context = canvas.getContext('2d');
                context.fillStyle = "rgba(0, 0, 0, 0.9)";
                context.lineWidth = lineWidth;
                context.strokeStyle = 'white';
    
                var prev = context.globalCompositeOperation;
                context.globalCompositeOperation = "destination-in";
                context.fillRect(0, 0, canvas.width, canvas.height);
                context.globalCompositeOperation = prev;
    
                const projection = d3.geoProjection(function(x, y) { return [x, y];}).scale(200)
                const path = d3.geoPath(projection, context);
    
                updateParticles();
                for (let i = 0; i < particles.length; i++) {
                    let p = particles[i];
                    context.beginPath();
                    context.moveTo((width*(1-scale)/2) + (p.x * width / 120 * scale), (height*(1-scale)/2) + (p.y * height / 80 * scale));
                    context.lineTo((width*(1-scale)/2) + (p.xt * width / 120 * scale), (height*(1-scale)/2) + (p.yt * height / 80 * scale));
                    context.stroke(); 
        
                    p.x = p.xt;
                    p.y = p.yt;
                    if(p.x < 0){
                      p.x = fieldWidth;
                    }
                    else if(p.x > fieldWidth){
                      p.x = 0;
                    }
                
                    p.life++;
                }
            }
            yield 1;
        }
    }
    
    
    function _scale(){return(
    0.7
    )}
    
    function _drawField(scale,d3,width,height){return(
    function drawField(canvas) {
      var context = canvas.getContext('2d');
    
      context.clearRect(0, 0, canvas.width, canvas.height);
      
      context.fillStyle = "#2c2c2c";
      context.fillRect(0, 0, canvas.width, canvas.height);
    
      const lines = [
        [0,0,0, 120,0,0, 120,80,0, 0,80,0, 0,0,0],
        [60,0,0, 60,80, 0],
        [0,18,0, 18,18,0, 18,62,0, 0,62,0],
        [120,18,0, 102,18,0, 102,62,0, 120,62,0],
        [0,30,0, 6,30,0, 6,50,0, 0,50,0],
        [120,30,0, 114,30,0, 114,50,0, 120,50,0],
      ].map(l => l.map(c => c * scale))
    
      const num = 50
      const centerRound = []
      const cercle = d3.range(num).forEach(i => {
        const angle = i * Math.PI * 2 / (num - 1);
        centerRound.push((scale*120/2 + (9.15 * scale * Math.sin(angle))))
        centerRound.push((scale*80/2 + (9.15 * scale * Math.cos(angle))))
        centerRound.push(0)
      })
      lines.push(centerRound)
      
      lines.forEach(lineCoodrinates => {
        for(let i =0; i < lineCoodrinates.length; i += 3){
          context.beginPath();
          context.moveTo((width * (1-scale)/2) + (lineCoodrinates[i]* (width/120)), (height * (1-scale)/2) + (lineCoodrinates[i+1]* (height/80)));
          context.lineTo((width *(1-scale)/2) + (lineCoodrinates[(i+3)%lineCoodrinates.length]* (width/120)), (height   * (1-scale)/2) + (lineCoodrinates[(i+4)%lineCoodrinates.length]* (height/80)));
          context.lineWidth = 1.5;
          context.strokeStyle = 'white';
          context.stroke(); 
        }
      })
    }
    )}
    
    function _particles(){return(
    []
    )}
    
    function _createParticles(particles,MAX_PARTICLE_CNT,initOneParticle){return(
    function createParticles(){
      particles.length = 0;
      for (let i = 0; i < MAX_PARTICLE_CNT; i++) {
        let p = {};
        particles.push(p);
        initOneParticle(p);
      }
    }
    )}
    
    function _createLegend(twitterLogo){return(
    function createLegend(selection, width, height) {
      const svg = selection.append("svg")
        .attr("viewBox", [-width / 2, -height / 2, width, height])
        .attr("width", width)
        .attr("height", height);
    
      svg.append("text")
        .attr("transform", `translate(${-width*0.5},-${height*0.5})`)
        .attr('class', 'title')
        .attr('x', width * 0.05)
        .attr('y', height * 0.1)
        .attr('font-size', width * 0.05)
        .attr('text-anchor', 'start')
        .attr('fill', 'white')
        .text('Football Wind ⚽️💨')
      
      svg.append("text")
        .attr("transform", `translate(${-width*0.5},-${height*0.5})`)
        .attr('class', 'sub-title')
        .attr('x', width * 0.05)
        .attr('y', height * 0.15)
        .attr('font-size', width * 0.016)
        .attr('text-anchor', 'start')
        .attr('fill', 'white')
        .text('Force field visualisation created from the aggregation of 882,536 passes from 890 matches played in various major leagues/cups')
      
      svg
        .append("text")
        .attr("transform", `translate(15,${height*0.38})`)
        .attr('font-size', width*0.016)
        .attr('text-anchor', 'middle')
        .attr('fill', 'white')
        .text("Direction of play →")
      
      const twitter = svg.append('a')
        .attr('href', 'https://twitter.com/karim_douieb')
        .attr('target', '_blank')
        .style('pointer-events', 'initial')
        
      twitter.append("image")
        .attr("xlink:href", twitterLogo)
        .attr("x", width*0.31)
        .attr("y", height * 0.45)
        .attr("width", width*0.025)
      
      twitter.append("text")
        .attr('x', width*0.34)
        .attr('y', height * 0.47)
        .attr('font-size', width*0.016)
        .attr('text-anchor', 'start')
        .attr('fill', 'white')
        .text('@karim_douieb')
     
      return svg.node();
    }
    )}
    
    function _initOneParticle(random,MAX_PARTICLE_LIFE,fieldWidth,fieldHeight,isCoordIdxValid){return(
    function initOneParticle(p){
      p.life = random(0, MAX_PARTICLE_LIFE);
      let tryCnt = 0;
      p.x = random(0, fieldWidth-1);
      p.y = random(0, fieldHeight-1);
      p.xt = p.x;
      p.yt = p.y;
    
      do {
        let xIdx = random(0, fieldWidth-1)//lons.length-1);
        let yIdx = random(0, fieldHeight-1)//lats.length-1);
        if (isCoordIdxValid(xIdx,yIdx)){
          p.x = xIdx;
          p.y = yIdx;
          p.xt = xIdx;
          p.yt = yIdx;
          break;
        }
      }while(tryCnt++ < 30);
    }
    )}
    
    function _updateParticles(particles,isParticleValid,initOneParticle,passFlowField,factor,maxSpeed){return(
    function updateParticles(){
      for (let i = 0; i < particles.length; i++) {
        let p = particles[i];
        if(!isParticleValid(p)){
          initOneParticle(p);
        }
    
        let xIdx = Math.ceil(p.x);
        let yIdx = Math.ceil(p.y);
    
        const vect = passFlowField[`${xIdx}_${yIdx}`]
        
        if(vect) {
          let vx = vect.dist * Math.cos(vect.angle) * factor / maxSpeed;
          let vy = vect.dist * Math.sin(vect.angle) * factor / maxSpeed;
          p.xt = p.x + vx;
          p.yt = p.y + vy;
        }
      }
    }
    )}
    
    function _isParticleValid(MAX_PARTICLE_LIFE,fieldHeight,fieldWidth,isCoordIdxValid){return(
    function isParticleValid(p){
      if(p.life > MAX_PARTICLE_LIFE){
        return false;
      }
      else if(p.y > fieldHeight || p.x > fieldWidth){
        return false;
      }
    
      let xIdx = Math.ceil(p.x);
      let yIdx = Math.ceil(p.y);
      return isCoordIdxValid(xIdx,yIdx)
    }
    )}
    
    function _isCoordIdxValid(passFlowField){return(
    function isCoordIdxValid(xIdx,yIdx){
      return (passFlowField[`${xIdx}_${yIdx}`]);
    }
    )}
    
    function _findInArray(){return(
    function findInArray(arr, val){
      if(val < arr[0] || val > arr[arr.length-1]){
        return -1;
      }
    
      let low = 0, high = arr.length-1;
      let idx = 0;
      for (let i = 0; i < arr.length; i++) {
        idx = Math.floor((high-low) / 2) + low;
        if(arr[idx] > val){
          high = idx;
        }
        else{
          low = idx;
        }
    
        if(high - low < 2){
          break;
        }
      }
    
      return idx;
    }
    )}
    
    function _random(){return(
    function random(min, max) {
      if (max == null) {
        max = min;
        min = 0;
      }
      return min + Math.floor(Math.random() * (max - min + 1));
    }
    )}
    
    async function _jsonData(FileAttachment){return(
    await FileAttachment("wind.json").json()
    )}
    
    function _meanAngleDeg(d3){return(
    function meanAngleDeg(a) {
        return Math.atan2(
            d3.mean(a.map(Math.sin)),
            d3.mean(a.map(Math.cos))
        );
    }
    )}
    
    function _23(d3,DOM,passFlowField)
    {
      const size = 9
      const svg = d3.select(DOM.svg(size * 122, size * 82));
      const pass = Object.values(passFlowField)
      svg.selectAll("circle")
        .data(pass)
        .join(enter => enter.append("circle")
          .attr("r", size * 0.15)
          .attr("cx", d => size + d.x * size)
          .attr("cy", d => size + d.y * size)
        )
    
      svg.selectAll("line")
        .data(pass)
        .join(enter => enter.append("line")
          .attr("transform", d => `translate(${size + d.x * size}, ${size + d.y * size})`)
          .attr("x1", d => 0)
          .attr("y1", d => 0)
          .attr("x2", d => d.dist * Math.cos(d.angle))
          .attr("y2", d => d.dist * Math.sin(d.angle))
          .style("stroke", 'black')
        )
      return svg.node()
    }
    
    
    function _passFlowField(FileAttachment){return(
    FileAttachment("passFlowField.json").json()
    )}
    
    function _fieldWidth(width){return(
    width
    )}
    
    function _fieldHeight(height){return(
    height
    )}
    
    function _height(width){return(
    width / 120 * 80
    )}
    
    function _28(md){return(
    md`## Style`
    )}
    
    function _fontName(){return(
    'Staatliches'
    )}
    
    function* _style(html,fontName)
    {
      yield html`<style>
    @import url('https://fonts.googleapis.com/css2?family=${fontName}&display=swap');
    
      .overlay {
        font-family: '${fontName}', sans-serif;
      }
    </style>`
    }
    
    
    function _31(md){return(
    md`## Dependencies`
    )}
    
    function _twitterLogo(FileAttachment){return(
    FileAttachment("Twitter_Bird.svg (3).png").url()
    )}
    
    function _d3(require){return(
    require("d3@6")
    )}
    
    export default function define(runtime, observer) {
      const main = runtime.module();
      function toString() { return this.url; }
      const fileAttachments = new Map([
        ["wind.json", {url: new URL("./files/01042aede72a12607f2e8ea63b6dbda53769fafb9a3e97d5b4d6b8d1010ae449f0215355d9afc36f3105ed44bfa95b633b64adfc5c61aa8ce7f5731d651f3edc.json", import.meta.url), mimeType: "application/json", toString}],
        ["passFlowField.json", {url: new URL("./files/64556a58ddfcb6ff4c82d69214b10b371b6a80649bef0949808c534a9567aa2d14aa5eeca817ae7d559d67de39b32e868e9c1bc01a575fd839f7d856d3775ed2.json", import.meta.url), mimeType: "application/json", toString}],
        ["Twitter_Bird.svg (3).png", {url: new URL("./files/ca7faa6ed58ddec89cfb70c25bb355ef7099071b8984682aa49f1b77d65cc2519b4cb806566a2d1e55afde57ab9bed1b3ce80c696ac56993667bcdf6c48d9b86.png", import.meta.url), mimeType: "image/png", toString}]
      ]);
      main.builtin("FileAttachment", runtime.fileAttachments(name => fileAttachments.get(name)));
      main.variable(observer()).define(["md"], _1);
      main.variable(observer()).define(["d3","width","height","drawField","createParticles","createLegend"], _2);
      main.variable(observer("viewof factor")).define("viewof factor", ["Inputs"], _factor);
      main.variable(observer("factor")).define("factor", ["Generators", "viewof factor"], (G, _) => G.input(_));
      main.variable(observer("viewof maxSpeed")).define("viewof maxSpeed", ["Inputs"], _maxSpeed);
      main.variable(observer("maxSpeed")).define("maxSpeed", ["Generators", "viewof maxSpeed"], (G, _) => G.input(_));
      main.variable(observer("viewof lineWidth")).define("viewof lineWidth", ["Inputs"], _lineWidth);
      main.variable(observer("lineWidth")).define("lineWidth", ["Generators", "viewof lineWidth"], (G, _) => G.input(_));
      main.variable(observer("MAX_PARTICLE_LIFE")).define("MAX_PARTICLE_LIFE", _MAX_PARTICLE_LIFE);
      main.variable(observer("MAX_PARTICLE_CNT")).define("MAX_PARTICLE_CNT", _MAX_PARTICLE_CNT);
      main.variable(observer()).define(["d3","lineWidth","updateParticles","particles","width","scale","height","fieldWidth"], _8);
      main.variable(observer("scale")).define("scale", _scale);
      main.variable(observer("drawField")).define("drawField", ["scale","d3","width","height"], _drawField);
      main.variable(observer("particles")).define("particles", _particles);
      main.variable(observer("createParticles")).define("createParticles", ["particles","MAX_PARTICLE_CNT","initOneParticle"], _createParticles);
      main.variable(observer("createLegend")).define("createLegend", ["twitterLogo"], _createLegend);
      main.variable(observer("initOneParticle")).define("initOneParticle", ["random","MAX_PARTICLE_LIFE","fieldWidth","fieldHeight","isCoordIdxValid"], _initOneParticle);
      main.variable(observer("updateParticles")).define("updateParticles", ["particles","isParticleValid","initOneParticle","passFlowField","factor","maxSpeed"], _updateParticles);
      main.variable(observer("isParticleValid")).define("isParticleValid", ["MAX_PARTICLE_LIFE","fieldHeight","fieldWidth","isCoordIdxValid"], _isParticleValid);
      main.variable(observer("isCoordIdxValid")).define("isCoordIdxValid", ["passFlowField"], _isCoordIdxValid);
      main.variable(observer("findInArray")).define("findInArray", _findInArray);
      main.variable(observer("random")).define("random", _random);
      main.variable(observer("jsonData")).define("jsonData", ["FileAttachment"], _jsonData);
      main.variable(observer("meanAngleDeg")).define("meanAngleDeg", ["d3"], _meanAngleDeg);
      main.variable(observer()).define(["d3","DOM","passFlowField"], _23);
      main.variable(observer("passFlowField")).define("passFlowField", ["FileAttachment"], _passFlowField);
      main.variable(observer("fieldWidth")).define("fieldWidth", ["width"], _fieldWidth);
      main.variable(observer("fieldHeight")).define("fieldHeight", ["height"], _fieldHeight);
      main.variable(observer("height")).define("height", ["width"], _height);
      main.variable(observer()).define(["md"], _28);
      main.variable(observer("fontName")).define("fontName", _fontName);
      main.variable(observer("style")).define("style", ["html","fontName"], _style);
      main.variable(observer()).define(["md"], _31);
      main.variable(observer("twitterLogo")).define("twitterLogo", ["FileAttachment"], _twitterLogo);
      main.variable(observer("d3")).define("d3", ["require"], _d3);
      return main;
    }