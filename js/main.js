var margin = {top: 20, right: 20, bottom: 30, left: 40},
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

var selectedItems=[];

var graphCounter=0;

var dataset = [];
//Plot Model
var plot =  {
              title:"first",
              xAxis:"-",
              yAxis:"-",
              children:{//maybe I only need to save the conecting objects
                          number:0,
                          conecting_elements:"",
                       },
              parent:{
                number:0,
                conecting_elements:"",
              },
            }

for (i=0;i<db.length;i++){
          dataset.push([db[i].mpg,db[i].weight]);
        }
        plot.title="mpg/weight";
        plot.xAxis="mpg";
        plot.yAxis="weight";

scatterPlot();