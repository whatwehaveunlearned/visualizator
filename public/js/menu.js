//For the menu at least temporatlly I decided to create a main fillmenu function and smaller functions for each of the 5 types of menus
//that I can think of right now. Main, dbMenu, attrMenu, graphsMenu, operationsMenu
function mainMenu(position){
  d3.select("#start").remove();
  d3.select("#mainMenu").remove();
  var menu = ["Add Db","Open Db Card"];
  fillmenu(menu,position,"main","general")
  d3.selectAll("#mainMenu > p")
    .on("click",function(d)
    {
      //if(this.id=="Add Db") dbAddMenu(d3.mouse(d3.select("#applicationArea").node()));
      if (this.id=="Add Db") addDbMainMenu(d3.mouse(d3.select("#applicationArea").node()));
      else if (this.id=="Open Db Card") dbListMenu(d3.mouse(d3.select("#applicationArea").node()));
      else if (this.id=="Minimize") minimize(d3.mouse(d3.select("#applicationArea").node()));
    });
}

function addDbMainMenu(position){
  var menu = ["DataGov","OnComputer"];
  fillmenu(menu,position,"dbAddMain","general");
  d3.selectAll("#dbAddMainMenu > p")
    .on("click",function(d)
    {
      if(this.id=="DataGov") dataGovMenu(position);
      else dbAddMenu(position);
      //d3.selectAll("#dbAddMainMenu").remove();
    });
}

function dataGovMenu(position){
  var menu = ["Topics","Tags"];
  fillmenu(menu,position,"dataGov","general");
  d3.selectAll("#dataGovMenu > p")
    .on("click",function(d)
    {
      if(this.id=="Topics") searchDataGov(position,"Topics");
      else if(this.id=="Tags") searchDataGov(position,"Tags");
      //d3.selectAll("#dbAddMainMenu").remove();
    });
  d3.select("#dataGovMenu")
    .append("div")
    .append("input")
    .attr("id","value");
  d3.select("#dataGovMenu")
    .append("button")
    .attr({
        "id": "search",
        "type": "text",
    })
    .on("click",function(d)
    {
      searchDataGov(position);
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
      loadDb(this.id,databasesObjects.length,position);
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
      //attrMenu(d3.mouse(d3.select("#applicationArea").node()),selectDb(this.id))
      dbKwCard(db,position);
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
      graphsMenu(d3.mouse(d3.select("#applicationArea").node()),selected.length,selected);
    });
}

function graphsMenu(position,numAttrs,attrs){
  d3.select("#graphsMenu").remove();
  var dataToRender = [];
  var dataObjects = [];
  var attrs=attrs;//necesary to pass the info to .on
  if (numAttrs==1){
    var menu = ["histogram","lineChart","map"];
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
      if(this.id=="Extract") extract(thisArea,position);
      else if (this.id=="Change Graph Type") changeType(thisArea,position);
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
function fillmenu (menuItems,menuPos,name,area){
  //d3.select(".btn-group-vertical").remove();
  var attrBox = d3.select("body").append("div")
          .attr({
            class:"btn-group-vertical",
            id: name + "Menu",
            "role":"group"
          })
          .style("left", menuPos[0] + "px")
          .style("top", menuPos[1]  + "px");
    for (value in menuItems){
      attrBox.append("p")
             .attr({
                class:"notselected",
                id:menuItems[value]
              })
            .text(menuItems[value])
    }
  $( ".btn-group-vertical" ).draggable({revert: "valid"});
  attrBox.append("span")
       .attr("class","glyphicon glyphicon-remove menuRemove")
       .on("click",function()
        {
          $("#"+name+"Menu").remove();
        });
}