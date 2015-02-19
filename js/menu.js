function dbMenu(position){
  d3.select("#start").remove();
  var menu = [];
  for (element in databasesList){
    menu.push(databasesList[element].name);
  }
  fillmenu(menu,position,false,"databases","general");
  d3.selectAll("#databasesMenu > p")
    .on("click",function(d)
    {
      loadDb(this.id);
    });
}

function menu(position,area){
  //MENU VARIABLES
  //Menu Items
  var menu = ["Add Db","Add","exclude","Difference","Average","Change Graph Type","Other Attrs"];
  fillmenu(menu,position,false,"main",area);
  //attrselected
  var selected = [];
}

//Fills in menu
function fillmenu (menuItems,position,isdata,name,area){
  d3.select(".btn-group-vertical").remove();
  var attrBox = d3.select("body").append("div")
          .attr({
            class:"btn-group-vertical",
            id: name + "Menu",
            "role":"group"
          })
          .style("left", position[0] + "px")     
          .style("bottom", position[1] + "px");
  if(isdata==false){
    for (value in menuItems){
      attrBox.append("p")
             .attr({
                class:"menuItem",
                id:menuItems[value]
              })
            .text(menuItems[value])
            .on("click",function(d,i,area,menuItems){
              if(this.id=="Add"){
                add(area);
              }else if(this.id=="Change Graph Type"){
                changeType();
              }
              else if(this.id=="Other Attrs"){
                 fillmenu(db[0],position,true,"attr",area);
              }
            });
    }
    }else{
      for (value in menuItems){
        attrBox.append("p")
              .attr({
                class:"menuItem",
                id: value
                })
              .text(value)
              .on("click",function(d,i){
                selected.push(this.id);
                if (selected.length>1){
                  dataset = [];
                  for (item in selectedItems){
                    dataset.push([eval("selectedItems[item]." + selected[0]),eval("selectedItems[item]." + selected[1])]);
                  }
                  changeAttr(selected);
                  selected=[];
                  d3.select("#attrMenu").remove();
                }
              });
      }
    }
  $( ".btn-group-vertical" ).draggable({revert: "valid"});
}