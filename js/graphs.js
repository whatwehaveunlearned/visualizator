//Area Creator.
//Creates a visual Area. Creates a model of the view. Launches the proper graph.
function areaCreator (title,xAxisName,yAxisName,data,type){
  d3.select("#applicationArea").append("div")
            .attr({
              class:"chartArea",
              "id":"graphArea"+graphCounter
            });
  var plot =  {
              name: "graphArea"+graphCounter,
              title:title,
              xAxis:xAxisName,
              yAxis:yAxisName,
              data: data,
              type: type
        /*      children:{ //maybe I only need to save the conecting objects
                          number:0,
                          conecting_elements:"",
                       },
              parent:{
                number:0,
                conecting_elements:"",
              }, */
            }
  areas.push(plot);
  eval(type+"()");
  graphCounter = graphCounter +1;
}

//Function to search for a graphArea object
function searchArea(areaName){
  for (each in areas){
    if(areas[each].name==areaName){
      return areas[each];
    }
  }
}

function addTitle(svg){
  svg.append("text")
     .text(plot.title)
     .attr({
       x: 500,
       y: 50, 
       "font-family": "sans-serif",
       "font-size": 50,
       fill: "black",
       "text-anchor":"middle"
    })
    .on("mouseover",function(d,i){
      $(this.parentElement.parentElement).draggable();
      $(this.parentElement.parentElement).draggable("enable");
      var area = searchArea(this.parentElement.parentElement.parentElement.id);
      link(area);
    })
    .on("mouseout",function(d,i){
      $(this.parentElement.parentElement).draggable("disable");
    });
}

function scatterPlot(){

  var x = d3.scale.linear()
      .range([0, width]);

  var y = d3.scale.linear()
      .range([height, 0]);

  var color = d3.scale.category10();

  var xAxis = d3.svg.axis()
      .scale(x)
      .orient("bottom");

  var yAxis = d3.svg.axis()
      .scale(y)
      .orient("left");

  var svg = d3.select("#graphArea"+graphCounter).append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
    .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  //Call lasso function
  var lasso = lassoFunction(svg,color);
  //lassoArray.push[lasso];
  
    
    x.domain(d3.extent(dataset, function(d) { return d[0]; })).nice();
    y.domain(d3.extent(dataset, function(d) { return d[1]; })).nice();

    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis)
      .append("text")
        .attr("class", "label")
        .attr("x", width)
        .attr("y", -6)
        .style("text-anchor", "end")
        .text(plot.xAxis);

    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis)
      .append("text")
        .attr("class", "label")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .text(plot.yAxis)

    svg.selectAll(".dot")
        .data(dataset)
      .enter().append("circle")
        .attr("id",function(d,i) {return "dot_" + i;}) // added
        .attr("class", "dot"+graphCounter)
        .attr("r", 3.5)
        .attr("cx", function(d) { return x(d[0]); })
        .attr("cy", function(d) { return y(d[1]); })
        .style("fill", function(d) { return color(d.species); })
        .style("stroke", "#000");

    lasso.items(d3.selectAll(".dot"+graphCounter));

    var legend = svg.selectAll(".legend")
        .data(color.domain())
      .enter().append("g")
        .attr("class", "legend")
        .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

    legend.append("rect")
        .attr("x", width - 18)
        .attr("width", 18)
        .attr("height", 18)
        .style("fill", color);

    legend.append("text")
        .attr("x", width - 24)
        .attr("y", 9)
        .attr("dy", ".35em")
        .style("text-anchor", "end")
        .text(function(d) { return d; });

    addTitle(svg);
}

function barChart(){

  var margin = {top: 20, right: 20, bottom: 30, left: 40},
      width = 960 - margin.left - margin.right,
      height = 500 - margin.top - margin.bottom;

  var x = d3.scale.ordinal()
      .rangeRoundBands([0, width], .1);

  var y = d3.scale.linear()
      .range([height, 0]);

  var xAxis = d3.svg.axis()
      .scale(x)
      .orient("bottom");

  var yAxis = d3.svg.axis()
      .scale(y)
      .orient("left");

  x.domain(d3.range(dataset.length))
  y.domain([0, d3.max(dataset, function(d) { return d[1]; })]).nice();

  var svg = d3.select("#graphArea"+graphCounter).append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
    .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis)
      .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .text(plot.yAxis);

    svg.selectAll(".bar")
        .data(dataset)
      .enter().append("rect")
        .attr("class", "bar")
        .attr("x", function(d,i) { 
          return x(i); })
        .attr("width", x.rangeBand())
        .attr("y", function(d) { return y(d[1]); })
        .attr("height", function(d) { return height - y(d[1]); });

    addTitle(svg);
}