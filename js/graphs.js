//Area Creator
function areaCreator (counter){
  d3.select("#applicationArea").append("div")
            .attr({
              class:"chartArea",
              "id":"graphArea"+counter
            })
}

function title(svg){
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
                })
                .on("mouseout",function(d,i){
                  $(this.parentElement.parentElement).draggable("disable");
                });
}

function removeDuplicates(objectVector){
  var arr = {};

  for ( var i=0; i < objectVector.length; i++ )
    arr[objectVector[i]['carName']] = objectVector[i];

  tempArray = new Array();
  for ( var key in arr )
    tempArray.push(arr[key]);
  selectedItems=tempArray;
}

function lassoFunction (svg,color){
  // Lasso functions to execute while lassoing
  var lasso_start = function() {
    lasso.items()
      //.attr("r",3.5) // reset size
      .style("fill",null) // clear all of the fills
      .classed({"not_possible":true,"selected":false}); // style as not possible
  };

  var lasso_draw = function() {
    // Style the possible dots
    lasso.items().filter(function(d) {return d.possible===true})
      .classed({"not_possible":false,"possible":true});

    // Style the not possible dot
    lasso.items().filter(function(d) {return d.possible===false})
      .classed({"not_possible":true,"possible":false});
  };

  var lasso_end = function() {
    
    var selected;
    // Reset the color of all dots
    lasso.items()
       .style("fill", function(d) { return color(d.species); });

    // Style the selected dots
    selected=lasso.items().filter(function(d) {
      console.log("s");
      return d.selected===true})
      .classed({"not_possible":false,"possible":false})
      .attr("r",17)
      .on("click",function(d){
        menu(d3.mouse(this),svg);  
      });

    // Reset the style of the not selected dots
    lasso.items().filter(function(d) {return d.selected===false})
      .classed({"not_possible":false,"possible":false})
      //.attr("r",3.5);

      for (i=0; i<selected[0].length;i++) {
        selectedItems.push(db[selected[0][i].id.split("_")[1]])
      }

    //Remove duplicates from selectedItems
    removeDuplicates(selectedItems);
  };

  // Create the area where the lasso event can be triggered
  var lasso_area = svg.append("rect")
                        .attr("width",width)
                        .attr("height",height)
                        .style("opacity",0);

  // Define the lasso
  var lasso = d3.lasso()
        .closePathDistance(75) // max distance for the lasso loop to be closed
        .closePathSelect(true) // can items be selected by closing the path?
        .hoverSelect(true) // can items by selected by hovering over them?
        .area(lasso_area) // area where the lasso can be started
        .on("start",lasso_start) // lasso start function
        .on("draw",lasso_draw) // lasso draw function
        .on("end",lasso_end); // lasso end function

  // Init the lasso on the svg:g that contains the dots
  svg.call(lasso);

  return lasso;
}

function scatterPlot(){

  graphCounter = graphCounter +1;
  areaCreator(graphCounter);

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
        .style("fill", function(d) { return color(d.species); });

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

    title(svg);
}

function barChart(){
  graphCounter = graphCounter +1;
  areaCreator(graphCounter);

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

    title(svg);
}