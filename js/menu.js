//For the menu at least temporatlly I decided to create a main fillmenu function and smaller functions for each of the 5 types of menus
//that I can think of right now. Main, dbMenu, attrMenu, graphsMenu, operationsMenu
function mainMenu(position){
  d3.select("#start").remove();
  d3.select("#mainMenu").remove();
  var menu = ["Add Db","Create New Graph","Minimize"];
  fillmenu(menu,position,"main","general")
  d3.selectAll("#mainMenu > p")
    .on("click",function(d)
    {
      if(this.id=="Add Db") dbAddMenu(d3.mouse(this));
      else if (this.id=="Create New Graph") dbListMenu(d3.mouse(this));
      else if (this.id=="Minimize") minimize(d3.mouse(this));
    });
}

function dbAddMenu(position){
  d3.select("#dbAddMenu").remove();
  var menu = [];
  for (element in databasesList){
    menu.push(databasesList[element].name);
  }
  fillmenu(menu,position,"dbAdd","general");
  d3.selectAll("#dbAddMenu > p")
    .on("click",function(d)
    {
      loadDb(this.id,databasesObjects.length);
      d3.selectAll("#dbAddMenu").remove();
    });
}

function dbListMenu(position){
  d3.select("#dbListMenu").remove();
  var menu = [];
  for (element in databasesObjects){
    menu.push(databasesObjects[element].name);
  }
  fillmenu(menu,position,"dbList","general");
  d3.selectAll("#dbListMenu > p")
    .on("click",function(d)
    {
      d3.selectAll("#dbListMenu").remove();
      attrMenu(d3.mouse(this),selectDb(this.id))
    });
}

function attrMenu(position,db){
  d3.select("#attrMenu").remove();
  var menu = Object.keys(db.data[0]);
  fillmenu(menu,position,"attr","general");
  //attrselected
  var selected = [];
  d3.selectAll("#attrMenu > p")
    .on("click",function(d)
    {
      if(this.className=="notselected"){
        d3.select("#"+this.id).attr("class", "selected");
        selected.push(this.id);
      }else{
        d3.select("#"+this.id).attr("class", "notselected");
        selected.pop(this.id);
      }
      d3.selectAll("#graphsMenu").remove();
      graphsMenu(d3.mouse(this),selected.length,selected);
    });
}

function graphsMenu(position,numAttrs,attrs){
  d3.select("#graphsMenu").remove();
  var dataToRender = [];
  var dataObjects = [];
  var attrs=attrs;//necesary to pass the info to .on
  if (numAttrs==1){
    var menu = ["histogram","lineChart"];
    xAxisName = "";
    yAxisName = attrs[0];
    title = db.name + " " + attrs[0];
  } 
  else if (numAttrs==2){
    var menu =["scatterPlot"];
    xAxisName = attrs[0];
    yAxisName = attrs[1];
    title = db.name + " " + attrs[0] + "/" +attrs[1];
  } 
  else var menu=["Select one or two attributes"] 
  fillmenu(menu,position,"graphs","general");
  //attrselected
  d3.selectAll("#graphsMenu > p")
    .on("click",function(d)
    {
      selectData(db,db.data,attrs,this.id,dataToRender,dataObjects);
      areaCreator (title,db,xAxisName,yAxisName,dataToRender,dataObjects,this.id);
      d3.selectAll(".btn-group-vertical").remove();
      mainMenu(position);
    });
}

function operationsMenu(position,thisArea){
  var thisArea = thisArea;
  d3.select("#operationsMenu").remove();
  var menu = ["Extract","exclude","Difference","Average","Change Graph Type","Other Attrs"];
  fillmenu(menu,position,"operations","general");
  //attrselected
  d3.selectAll("#operationsMenu > p")
    .on("click",function(d)
    {
      if(this.id=="Extract") extract(thisArea);
      else if (this.id=="chage Graph Type") changeType();  
    });
}

function minimize(position){
  d3.select("#mainMenu").remove();
  d3.select("#minMenu").remove();
  d3.select("#applicationArea")
    .append("div")
    .attr("id","minMenu")
    .append("svg")
    .append("circle")
    .attr({
      "cx":position[0],
      "cy":position[1],
      "r":10
    })
    .style("fill","red")
    .style("stroke", "#000")
    .on("mouseover",function(d){
      $("#minMenu").draggable();
      $("#minMenu").draggable("enable");
    })
    .on("mouseout",function(d){
      $("#minMenu").draggable("disable");
    })
    .on("dblclick",function(d){
      d3.select("#minMenu").remove();
      mainMenu(position);
    });
}

//Fills in menu
function fillmenu (menuItems,position,name,area){
  //d3.select(".btn-group-vertical").remove();
  var attrBox = d3.select("body").append("div")
          .attr({
            class:"btn-group-vertical",
            id: name + "Menu",
            "role":"group"
          })
          .style("left", position[0] + "px")     
          .style("bottom", position[1] -50 + "px");
    for (value in menuItems){
      attrBox.append("p")
             .attr({
                class:"notselected",
                id:menuItems[value]
              })
            .text(menuItems[value])
    }
  $( ".btn-group-vertical" ).draggable({revert: "valid"});
}