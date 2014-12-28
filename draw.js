/*//For Testing purposes Random Generator
var dataset = [];
var Size =25;
for (var i=0;i<Size;i++){
	var newNumber = Math.round(Math.random() * 30);
	dataset.push(newNumber);
}*/
var dataset = [[5, 20], [480, 90], [250, 50], [100, 33], [330, 95], [410, 12], [475, 44], [25, 67], [85, 21], [220, 88]];
//Define margin and Size of container
var margin = {
    top: 20,
    right: 20,
    bottom: 30,
    left: 60
};
var w = 500 - margin.left - margin.right;
var h = 350 - margin.top - margin.bottom;

//Code Starts Here
main();

//Main Function
function main (){

	scatterPlot();
	
	//Viz Types Functions
	//simpleCol
	function simpleCol (){
		var barPadding=1;
	  	//Create svg element
	  	var svg = d3.select("div")
	              .append("svg")
	              .attr("width",w)
	              .attr("height",h);
	  	svg.selectAll("rect")
	     .data(dataset)
	     .enter()
	     .append("rect")
	     .attr({
	        x: function(d,i){ return i*(w/dataset.length); },
	        y: function(d) { return h - (d*4)},
	        width: w/dataset.length - barPadding,
	        height: function (d) {return d*4;},
	        fill: function(d) { return "rgb(0,0,"+(d*10)+")";}
	      });

	  	svg.selectAll("text")
	     .data(dataset)
	     .enter()
	     .append("text")
	     .text(function(d){
	        return d;
	     }) 
	     .attr({
	        x: function(d,i){ return i*(w/dataset.length) + (w/dataset.length - barPadding)/2; },
	        y: function(d) { return +14 + h - (d*4)}, 
	        "font-family": "sans-serif",
	        "font-size": 11,
	        fill: "white",
	        "text-anchor":"middle"
	      });          

	}

	function scatterPlot(){
	  var padding = 30;
	  //variable to format ticks
	  //var formatAsPercentage = d3.format(".1%");
	  //Scale
	  var xScale = d3.scale.linear()
	  				 .domain([0,d3.max(dataset, function(d) { return d[0]; } )])
	  				 .range([padding,w-padding]);
	  var yScale = d3.scale.linear()
	  				 .domain([0, d3.max(dataset, function(d) { return d[1]; } )])
	  				 .range([h-padding,padding]);
	  var rScale = d3.scale.linear()
	  				 .domain([0, d3.max(dataset, function(d) { return d[1]; } )])
	  				 .range([2,5]);
	  //Axis
	  var xAxis = d3.svg.axis()
	  					.scale(xScale)
	  					.orient("bottom")
	  					.ticks(10);
	  var yAxis = d3.svg.axis()
	  					.scale(yScale)
	  					.orient("left")
	  					.ticks(10);
	  					//.tickFormat(formatAsPercentage);
	  
	  //svg element
	  var svg = d3.select("#chartArea")
	              .append("svg")
	              .attr("width",w)
	              .attr("height",h);
	  
	  //Draw scatterplot
	  svg.selectAll("circle")
	     .data(dataset)
	     .enter()
	     .append("circle")
	     .attr({
	        cx: function(d,i){ return xScale(d[0]); },
	        cy: function(d) { return yScale(d[1])},
	        r: function(d) { return rScale(d[1])},
	        height: function (d) {return d*4;},
	        fill: function(d) { return "rgb(0,0,"+(d*10)+")";}
	      });
	  
	  //Draw Text
	  svg.selectAll("text")
	     .data(dataset)
	     .enter()
	     .append("text")
	     .text(function(d){
	        return d[0] + "," + d[1];
	     }) 
	     .attr({
	        x: function(d,i){ return xScale(d[0]); },
	        y: function(d) { return yScale(d[1])}, 
	        "font-family": "sans-serif",
	        "font-size": 11,
	        fill: "red",
	        "text-anchor":"middle"
	      });
	   
	   //Draw Axis
	   svg.append("g")
	   	  .attr({
	   	  	class: "axis",
	   	  	"transform": "translate(0," + (h-padding) + ")"
	   	  })
	   	  .call(xAxis);

	   	svg.append("g")
	   	  .attr({
	   	  	class: "axis",
	   	  	"transform": "translate(" + (padding) + ",0)"
	   	  })
	   	  .call(yAxis);          
	}
	//Colviz
	function colviz (){
		var svgContainer = d3.select("body").append("svg")
			                 .attr("class", "main")
			                 .attr("width", width)
		                     .attr("height", height)
		                     .attr("padding", 20);

		//Holds the visualization
		var vizGroup = svgContainer.append("g")
								   .attr("transform", "translate(1,0)");


		//Scale creation
		var xScale = d3.scale.linear()

								.domain([0,db.length])
								.range([0,width]);

		var yScale = d3.scale.linear()
								.domain([0,8])
								.range([height,0]);

		//Axis Creation
		var yAxis = d3.svg.axis()
						  .scale(yScale)
						  .orient("left")
						  .ticks(8);

	  	var xAxis = d3.svg.axis()
	  					.scale(xScale)
	  					.orient("bottom")
	  					.ticks(10);

		//Painting the Axis
		var xAxisGroup = svgContainer.append("g")
	                             .attr("class", "axis")
	    						 .call(xAxis)
	    						 .selectAll("text")  
					             .style("text-anchor", "end")
					             .attr("y", 300)
					             .text( function (d,i) { console.log(db[i].carName);return db[i].carName })
					             .attr("transform", function(d) {
					                return "rotate(-65)" 
					              });
		var yAxisGroup = svgContainer.append("g")
		                             .attr("class", "axis")
		    						 .call(yAxis);

		var cols = vizGroup.selectAll("rect")
		                .data(db)
		                .enter()
		                .append("rect");

		//Painting the cols
		var colsAttributes = cols
		                       .attr("x", function (d,i) { return xScale(i); })
		                       .attr("width", 5 )
		                       .attr("y", function (d) { return yScale(d.cylinders); } )
		                       .attr("height", function(d) { return height - yScale(d.cylinders); });

		//Add the SVG Text Element to the svgContainer
		var text = vizGroup.selectAll("text")
		                       .data(db)
		                       .enter()
		                       .append("text");

	/*	var textLabels = text
		                 .attr("x", function(d,i) { return xScale(i); })
		                 .attr("y", height)

		                 .text( function (d,i) { return db[i].carName })
		                 .attr("font-family", "sans-serif")
		                 .attr("font-size", "5px")
		                .attr("fill", "red");*/

	}
}