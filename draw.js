//Author:Alberto Gonzalez Martinez. LAVA LAB 
//email:agon@hawaii.edu
//agon.whatwehaveunlearned.com
//date: 2015

//########################## GLOBAL VARIABLES DECLARATION ########################################################
//For Testing purposes Random Generator
var dataset = [];
var Size =25;
for (var i=0;i<Size;i++){
	var newNumber = Math.round(Math.random() * 30);
	dataset.push(newNumber);
}
//var dataset = [[5, 20], [480, 90], [250, 50], [100, 33], [330, 95], [410, 12], [475, 44], [25, 67], [85, 21], [220, 88]];
//var dataset = [5,10,20,25,4,15,24,23,30,32,32,32,12,31,34];
//Define margins, width and height of container
var margin = {
    top: 20,
    right: 20,
    bottom: 30,
    left: 60
};
var w = 500 - margin.left - margin.right;
var h = 350 - margin.top - margin.bottom;

//##########################  END GLOBAL VARIABLES DECLARATION ########################################################

//Code Starts Here
main();

//############################################################################################################################

//Main Function
function main (){

	simpleCol();
	
	//************************* Viz Types Functions **********************************//
	
	//simpleCol Viz
	function simpleCol (){
		//Function Variables
		var barPadding=1;
		var padding = 20;

		//Scale
	  	var xScale = d3.scale.ordinal()
	  					.domain(d3.range(dataset.length))
	  					.rangeRoundBands([padding,w-padding],0.05);
	  	var yScale = d3.scale.linear()
	  				 .domain([0, d3.max(dataset)])
	  				 .range([h-padding,0]);
	  	//Axis
	  	var xAxis = d3.svg.axis()
	  					.scale(xScale)
	  					.orient("bottom")
	  					.ticks(10);
	  	var yAxis = d3.svg.axis()
	  					.scale(yScale)
	  					.orient("left")
	  					.ticks(10);

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
	        x: function(d,i){ return xScale(i); },
	        y: function(d) { return yScale(d)},
	        width: xScale.rangeBand(),
	        height: function (d) {return h - yScale(d) - padding;},
	        fill: function(d) { return "rgb(0,0,"+(d*10)+")";}
	      });

	    //Draw Text
	  	svg.selectAll("text")
	     .data(dataset)
	     .enter()
	     .append("text")
	     .text(function(d){
	        return d;
	     }) 
	     .attr({
	        x: function(d,i){ return xScale(i) + xScale.rangeBand()/2; },
	        y: function(d) { return  yScale(d) + 250/dataset.length}, 
	        "font-family": "sans-serif",
	        "font-size": 250/dataset.length,
	        fill: "white",
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

	//ScatterPlot Viz
	function scatterPlot(){
	  //Function Variables
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
	   	  	"transform": "translate(" + (margin.left) + ",0)"
	   	  })
	   	  .call(yAxis);          
	}

	//************************* END Viz Types Functions **********************************//
}