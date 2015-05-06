var TREE_PADDING_H = 5;
var TREE_PADDING_V = 90;
var MAX_THICKNESS = 10;
var MIN_THICKNESS = .5;

function LensTreeVis(simMatrix, svg)
{
	this.group = svg.append("g");
	this.clusters = simMatrix.getClusters();
	this.maxClusterMembership = this.clusters.children ?
		Math.max(this.clusters.children[0].members.length, this.clusters.children[1].members.length) :
		this.clusters.members.length;

	this.lensBounds = this.clusters.lens.getBounds();
}

LensTreeVis.prototype.visualize = function(depthCull)
{
	this.layout(this.clusters, 0, 0, depthCull);
	this.plot(this.clusters, 0, depthCull);	
}

LensTreeVis.prototype.getGroup = function()
{
	return this.group;
}

LensTreeVis.prototype.layout = function(cluster, depth, breadth, depthCull)
{

	// create a vertical layout
	if (cluster.children && (!depthCull || depth < depthCull)) 
	{
		// continue to deal with children
		var c1 = this.layout(cluster.children[0], depth+1, breadth, depthCull);
		var c2 = this.layout(cluster.children[1], depth+1, c1.breadth, depthCull);

		cluster.lensTree = {
			centroid: (c1.centorid + c2.centroid) / 2,
			depth: depth,
			breadth: c2.breadth
		};

	}
	else
	{
		// register me at current depth
		cluster.lensTree = {
			centroid: breadth,
			depth: depth,
			breadth: breadth + 1
		};
	}
	return cluster.lensTree;

}

LensTreeVis.prototype.setBrushCallback = function(_brush, _unbrush)
{
	this.brushCallback = _brush;
	this.unbrushCallback = _unbrush;

}

LensTreeVis.prototype.plot = function(cluster, depth, depthCull)
{
	function makeCurve(s, e)
	{
		var d = 
			"M" + s[0] + " " + s[1] + 
			" C " + s[0] + " " + (s[1] + TREE_PADDING_V/3) + ", " +
			e[0] + " " + (e[1] - TREE_PADDING_V/3) + ", " +
			e[0] + " " + e[1];
		return d;
	}

	var b = this.lensBounds;
	var lensTree = cluster.lensTree;
	var ret = null;
	var lensGroup = null;

	if (cluster.children && (!depthCull || depth < depthCull))
	{
		// append an invisible rectangle for events
		var c1 = this.plot(cluster.children[0], depth+1, depthCull);
		var c2 = this.plot(cluster.children[1], depth+1, depthCull);

		// attach my cluster
		lensGroup = cluster.lens.visualize(this.group);
		var x = (c1[0] + c2[0]) / 2 - b[0]/2;
		var y = lensTree.depth * (b[1]+TREE_PADDING_V);
		lensGroup.attr("transform", "translate(" + x + "," + y + ")");

		// attach curves
		var s = [x+b[0] / 2, y + b[1]];
		var c1Thickness = (cluster.children[0].members.length / this.maxClusterMembership)*(MAX_THICKNESS - MIN_THICKNESS) + MIN_THICKNESS;
		var c2Thickness = (cluster.children[1].members.length / this.maxClusterMembership)*(MAX_THICKNESS - MIN_THICKNESS) + MIN_THICKNESS;
	
		this.group.append("path")
			.attr("d", makeCurve(s, c1))
			.attr("stroke", "#cccccc")
			.attr("stroke-width", c1Thickness + "px")
			.attr("fill", "none");

		this.group.append("path")
			.attr("d", makeCurve(s, c2))
			.attr("stroke", "#cccccc")
			.attr("stroke-width", c2Thickness + "px")
			.attr("fill", "none");
		
		ret = [ x+b[0]/2, y ];
	}
	else
	{
		lensGroup = cluster.lens.visualize(this.group);
		var x = lensTree.centroid * (b[0]+TREE_PADDING_H);
		var y = lensTree.depth * (b[1]+TREE_PADDING_V);
		
		lensGroup.attr("transform", "translate(" + x + "," + y + ")");
		ret = [ x+b[0]/2, y ];
	}

	(function(thisCluster, lens, brush, unbrush) 
	{
		if (brush) {
			lens.on("mouseover", function() {
				//lens.select("rect").style("fill", "#FFA8A8");
				brush(thisCluster); 
			});
		}
		if (unbrush) {
			lens.on("mouseout", function() { 
				//lens.select("rect").style("fill", "white");
				unbrush(thisCluster); 
			});
		}
	})(cluster, lensGroup, this.brushCallback, this.unbrushCallback);
	return ret;
}



