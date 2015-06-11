var SEL_CELL_W = 190;
var SEL_CELL_H = 85;
var SEL_PADDING_H = 10;
var SEL_PADDING_V = 5;
var SELECTION_PADDING = 10;

/*
var COLOR_SELECTION = [
	"#CCFF99",
	"#FFCC66",	
];
*/
var COLOR_SELECTION = ['rgb(141,211,199)','rgb(255,255,179)','rgb(190,186,218)','rgb(251,128,114)','rgb(128,177,211)','rgb(253,180,98)'];

function ClusterSelection(svg, cluster, color, label)
{

	this.cluster = cluster;
	this.label = label ? label : "";
	this.color = color;
}

ClusterSelection.prototype.visualize = function(group)
{
	this.group = group;
	return this.cluster.getLens().visualize(this.group, [SEL_CELL_W, SEL_CELL_H], [SEL_PADDING_H, SEL_PADDING_V]);
}

ClusterSelection.prototype.getGroup = function() 
{
	return this.group;
}

ClusterSelection.prototype.getColor = function()
{
	return this.color;
}

ClusterSelection.prototype.getCluster = function()
{
	return this.cluster;
}

function ClusterSelector(svg)
{
	this.selections = [];
	this.selectionMap = d3.map();
	this.svg = svg;
}

ClusterSelector.prototype.setBrushCallback = function(_brush, _unbrush)
{
	this.brushCallback = _brush;
	this.unbrushCallback = _unbrush;
}

ClusterSelector.prototype.hasColors = function()
{
	return COLOR_SELECTION.length > 0;
}

ClusterSelector.prototype.updateDisplay = function()
{
	var clusterSelector = this;
	var lensBounds = this.lensBounds;
	var updateSelection = this.svg.selectAll("g.selectionGroup")
		.data(this.selections, function(selection) { return "" + selection.getCluster().getID(); })

	updateSelection.exit().remove();

	var Gs = updateSelection.enter().append("g")
		.attr("class", function(selection) 
		{
			selection.selectionGroup = d3.select(this);
			return "selectionGroup";
		})
		.attr("transform", function(d, i) { return 'translate(0,' + i * (lensBounds[1]+SELECTION_PADDING) + ")";})
		.on("mouseover", function(selection) 
		{
			if (clusterSelector.brushCallback) {
				clusterSelector.brushCallback(selection.getCluster());
			}
		})
		.on("mouseout", function(selection) 
		{
			if (clusterSelector.unbrushCallback) 
			{
				clusterSelector.unbrushCallback(selection.getCluster());
			}
		});


	Gs.append("rect")
		.attr("width", "500")
		.attr("height", lensBounds[1])
		.attr("x", "25")
		.attr("y", "0")
		.attr("rx", 10)
		.attr("ry", 10)
		.attr("class", "selectionRect")
		.style("fill", function(selection) 
		{
			var color = d3.rgb(selection.getColor());
			return "rgba(" + color.r + ", " + color.g + ", " + color.b + ", 0.55)"; 
		});

	Gs.append("g")
		.attr('transform', function(selection, i) 
		{
			var g = selection.visualize(d3.select(this)).attr("transform", "translate(30,0)");
			g.select("rect").style("fill", "rgba(255,255,255,0)");
			//return 'translate(0,' + i * (lensBounds[1]+SELECTION_PADDING) + ")"; 
			return "";
		});

	/*
	Gs.append("circle")
		.style("fill", function(selection) { return selection.getColor(); })
		.style("stroke", "black")
		.style("stroke-width", "0.5px")
		.attr("r", 10)
		.attr("cx", 7)
		.attr("cy", SEL_CELL_H/2);
	*/

	updateSelection.transition().attr("transform", function(d, i) { return 'translate(0,' + i * (lensBounds[1]+SELECTION_PADDING) + ")"; });

	// update map
	this.selectionMap = d3.map();
	for (var i=0; i < this.selections.length; i++)
	{
		this.selectionMap.set(this.selections[i].getCluster().getID(), i);
	}

}

ClusterSelector.prototype.add = function(cluster)
{
	// assign an appropriate color
	var selectionColor = COLOR_SELECTION[0];
	COLOR_SELECTION = COLOR_SELECTION.slice(1);

	// calculate the bounds for the lens
	var lensBounds = cluster.getLens().getBounds();
	lensBounds[0] = lensBounds[2]*SEL_CELL_W + (lensBounds[2]>1 ? lensBounds[2]-1 : 0) * SEL_PADDING_H;
	lensBounds[1] = lensBounds[3]*SEL_CELL_H + (lensBounds[3]>1 ? lensBounds[3]-1 : 0) * SEL_PADDING_V;
	this.lensBounds = lensBounds;

	var selection = new ClusterSelection(null, cluster, selectionColor);
	this.selections.push(selection);
	
	// update the display
	this.updateDisplay();

	return selectionColor;
}

ClusterSelector.prototype.remove = function(cluster)
{
	var index = this.selectionMap.get(cluster.getID());
	if (index === null || index === undefined) {
		return;
	}
	
	// add selection color 
	var sel = this.selections[index];
	COLOR_SELECTION.push(sel.getColor());

	// remove selection from array and rebuild map
	this.selections.splice(index, 1);
	this.updateDisplay();
}

ClusterSelector.prototype.highlightSelection = function(cluster, color)
{
	var index = this.selectionMap.get(cluster.getID());
	if (Number.isInteger(index)) 
	{
		var selection = this.selections[index];
		selection.selectionGroup.selectAll("rect.selectionRect").style("fill", color ? color : selection.getColor());
	}
}

