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

//Define margins, width and height of container
var margin = {
    top: 20,
    right: 20,
    bottom: 30,
    left: 60
};
var w = 500 - margin.left - margin.right;
var h = 350 - margin.top - margin.bottom;

var chartAreaGlobalCounter = 0;
/*var chartArea = {
	width:"420px",
	height:"310px",
	borderStyle:"double",
	borderWidth:"5px",
	backgroundColor:"#CCC"

}*/

//##########################  END GLOBAL VARIABLES DECLARATION ########################################################

//Code Starts Here
main();

//############################################################################################################################

//Main Function
function main (){

	areaCreator("chartArea0")
	//var chartCounter = areaCreator("chartArea"+chartAreaGlobalCounter,chartAreaGlobalCounter);
	simpleCol([0],"chartArea0");
	grabAttr();
	$( "#applicationArea" ).dblclick(function() {
  		areaCreator("chartArea"+chartAreaGlobalCounter);
	});
	click();
	//************************ Side Functions *************************************
	
	//Attr Bar
	function grabAttr (){
		var attrBox = d3.select("#sideBar").append("div")
						.attr({
							class:"btn-group-vertical",
							"role":"group"
						});
		for (attr in db[0]){
			attrBox.append("p")
				   .attr({
				   	class:"attr",
				   	id:attr
				   })
				   .text(attr);
		}
		$( ".attr" ).draggable({revert: "valid"});
	}

	//Area Creator
	function areaCreator (Areaname,counter){
		d3.select("#applicationArea").append("div")
							.attr({
								class:"chartArea",
								"id":Areaname
							})
		//To move chartArea
		$("#"+Areaname).draggable();
		counter = counter + 1;
		return(counter); 
	}


	//************************* Viz Types Functions **********************************
	
	//simpleCol Viz
	function simpleCol (attr1,chartArea){
		//Function Variables
		var barPadding=1;
		var padding = 20;

		//Scale
	  	var xScale = d3.scale.ordinal()
	  					.domain(d3.range(attr1.length))
	  					.rangeRoundBands([padding,w-padding],0.05);
	  	var yScale = d3.scale.linear()
	  				 .domain([0, d3.max(attr1)])
	  				 .range([h-padding,0]);
	  	//Axis
	  	var xAxis = d3.svg.axis()
	  					.scale(xScale)
	  					//.ticks(10)
	  					.orient("bottom");
	  	var yAxis = d3.svg.axis()
	  					.scale(yScale)
	  					//.ticks(10)
	  					.orient("left");

	  	//Create svg element
	  	var svg = d3.select("#chartArea0")
	              .append("svg")
	              .attr("width",w)
	              .attr("height",h);
	  	svg.selectAll("rect")
	     .data(attr1)
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
	     .data(attr1)
	     .enter()
	     .append("text")
	     .text(function(d){
	        return d;
	     }) 
	     .attr({
	        x: function(d,i){ return xScale(i) + xScale.rangeBand()/2; },
	        y: function(d) { return  yScale(d) + 250/attr1.length}, 
	        "font-family": "sans-serif",
	        "font-size": 250/attr1.length,
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

	   	$(".chartArea").droppable({
			drop: function (event,ui){
				var dataset = [];
				//Get attr to represent
				a = "db[i]." + ui.draggable.text();
				//Remove svg
				svg.remove();
				for (i=0;i<30;i++){
					dataset.push(eval(a));
				}

				simpleCol(dataset,chartArea);
			}
		});
		//To move chartArea
		$(".chartArea").draggable();        

	}

	//Simple ScatterPlot Viz
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

	function click(){
  // Ignore the click event if it was suppressed
  if (d3.event.defaultPrevented) return;

  // Extract the click location\    
  var point = d3.mouse(this)
  , p = {x: point[0], y: point[1] };

  // Append a new point
  svg.append("circle")
      .attr("transform", "translate(" + p.x + "," + p.y + ")")
      .attr("r", "5")
      .attr("class", "dot")
      .style("cursor", "pointer")
      .call(drag);
}

// Create the SVG
var svg = d3.select("body").append("svg")
  .attr("width", 700)
  .attr("height", 400)
  .on("click", click);

// Add a background
svg.append("rect")
  .attr("width", 700)
  .attr("height", 400)
  .style("stroke", "#999999")
  .style("fill", "#F6F6F6")

// Define drag beavior
var drag = d3.behavior.drag()
    .on("drag", dragmove);

function dragmove(d) {
  var x = d3.event.x;
  var y = d3.event.y;
  d3.select(this).attr("transform", "translate(" + x + "," + y + ")");
}
}