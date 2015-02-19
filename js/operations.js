//Adds 2 sets together to draw a new graph
function add (){ //Add needs to know the attrs in his parent.
  dataset = [];
  for (item in selectedItems){
    dataset.push([selectedItems[item].mpg,selectedItems[item].weight]);
  }
  areaCreator ("mpg/weight","mpg","weight",dataset,"scatterPlot");
}

//Changes the type of graph
function changeType(){ //Needs to know what graph is changing to and the attrs of his parent
	dataset = [];
	for (item in selectedItems){
    dataset.push([selectedItems[item].carName,selectedItems[item].weight]);
  }
  areaCreator (plot.title,"carName","weight",dataset,"barChart");
}

//Changes the Attrs
function changeAttrs(selected){
  graphId("name",selected[0]+"/"+selected[1],selected[0],selected[1],dataset)
  areaCreator (selected[0]+"/"+selected[1],selected[0],selected[1],dataset,"scatterPlot");
}

//Linking attrs
function link(area){
	console.log("");
}

function lassoFunction (svg,color,area){
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
        menu(d3.mouse(this),area);  
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

  //Removes duplicates of the lassoSelection
	function removeDuplicates(objectVector){
	  var arr = {};

	  for ( var i=0; i < objectVector.length; i++ )
	    arr[objectVector[i]['carName']] = objectVector[i];

	  tempArray = new Array();
	  for ( var key in arr )
	    tempArray.push(arr[key]);
	  selectedItems=tempArray;
	}
}