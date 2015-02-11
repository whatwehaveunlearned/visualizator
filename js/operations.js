function add (){
  dataset = [];
  for (item in selectedItems){
    dataset.push([selectedItems[item].mpg,selectedItems[item].weight]);
  }
  scatterPlot();
}