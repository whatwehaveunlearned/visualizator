function menu(position,svg){
    //MENU VARIABLES
    //Menu Items
    var menu1 = ["Add","exclude","Difference","Average","Change Graph Type","Other Attrs"];
    fillmenu(menu1,position,false,"main");
    //attrselected
    var selected = [];
    
    //MENU FUNCTIONS
    //Fills in menu
    function fillmenu (menuItems,position,isdata,name){
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
                .on("click",function(d,i){
                  if(this.id=="Add"){
                    add();
                  }else if(this.id=="Change Graph Type"){
                    changeType();
                  }
                  else if(this.id=="Other Attrs"){
                     fillmenu(db[0],position,true,"attr");
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
                      plot.title=selected[0]+"/"+selected[1];
                      plot.xAxis=selected[0];
                      plot.yAxis=selected[1];
                      d3.select("#attrMenu").remove();
                      scatterPlot();
                      selected=[];
                    }
                  });
          }
        }
      $( ".btn-group-vertical" ).draggable({revert: "valid"});
    }
  }