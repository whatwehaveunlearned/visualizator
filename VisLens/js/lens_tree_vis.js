var TREE_PADDING_H = 5;
var TREE_PADDING_V = 90;
var MAX_THICKNESS = 12;
var MIN_THICKNESS = 2.5;
var PATH_COLOR = "#cccccc";

function LensTreeVis(simMatrix, svg)
{
	this.group = svg.append("g");
	this.clusters = simMatrix.getClusters();
	var children = this.clusters.getChildren();
	this.maxClusterMembership = children ?
		Math.max(children[0].members.length, children[1].members.length) :
		this.clusters.members.length;
	this.lensBounds = this.clusters.lens.getBounds();
}

LensTreeVis.prototype.getRootCluster = function()
{
	return this.clusters;
}

LensTreeVis.prototype.visualize_D3Layout = function(depthCull, sizeCull, w, h)
{
	var tree = d3.layout.tree();
	if (w && h) {
		tree.size([w, h]);
	} else {
		tree.nodeSize([2, 15]);
	}
	var diagonal = d3.svg.diagonal().projection(function(d) { return [d.x, d.y];});
	var nodes = tree.nodes(this.clusters);
	var links = tree.links(nodes);

	// links
	this.group.selectAll("path.link").data(links).enter().append("path")
		.attr("class", "link")
		.attr("d", diagonal);

	// nodes
	var node = this.group.selectAll("g.node").data(nodes).enter().append("g")
		.attr("class", "node")
		.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")";})

	node.append("circle").attr("r", 1);
}

/*
LensTreeVis.prototype.foldUpToDepth = function(depth, cluster)
{
	if (!cluster) { cluster = this.getRootCluster(); }
	if (depth > 0)
	{
		cluster.children = cluster._children;
	}
	else {
		cluster.children = undefined;
	}

	var children = cluster.getChildren();
	if (children) 
	{
		this.foldUpToDepth(depth-1, children[0]);
		this.foldUpToDepth(depth-1, children[1]);
	}
}
*/

LensTreeVis.prototype.visualize_D3Layout_collapsable = function(width, height)
{
	var margin = {top: 20, right: 120, bottom: 20, left: 120},
    width = 960 - margin.right - margin.left,
    height = 800 - margin.top - margin.bottom;
    
	var i = 0, duration = 750, root = this.getRootCluster();

	var tree = d3.layout.tree()
		.size([height, width]);

	var diagonal = d3.svg.diagonal()
		.projection(function(d) { return [d.x, d.y]; });

	var svg = this.group;

	root.x0 = height / 2;
	root.y0 = 0;

	function collapse(d) 
	{
		var children = d.getChildren();
		d.links = undefined;

		if (children) 
		{
			d._children = children;
			for (var i=0, len=children.length; i < len; i++)
				collapse(children[i]);
			d.children = null;
		}
	}

	var treeVis = this;
	var rootChildren = root.getChildren();
	collapse(root);
	update(root);

	function update(source) 
	{
		// Compute the new tree layout.
		var nodes = tree.nodes(root).reverse();
		var links = tree.links(nodes);

		// Normalize for fixed-depth.
		nodes.forEach(function(d) { d.y = d.depth * 75; });

		// Update the nodes…
		var node = svg.selectAll("g.node")
			.data(nodes, function(d) { return d.id || (d.id = ++i); });

		// Enter any new nodes at the parent's previous position.
		var nodeEnter = node.enter().append("g")
			.attr("class", "node")
			.attr("transform", function(d) { return "translate(" + source.x0 + "," + source.y0 + ")"; })
			.on("click", expandNode);

		nodeEnter.append("circle")
			.attr("r", 1e-6)
			.style("fill", function(d) 
			{
				d.nodeCircle = this;	
				return d._children ? "steelblue" : "#fff"; 

			})
			.on('mouseover', function(clusterNode) {
				if (treeVis.brushCallback) {
					treeVis.brushCallback(clusterNode);
				}
			})
			.on('mouseout', function(clusterNode) 
			{
				if (treeVis.unbrushCallback) {
					treeVis.unbrushCallback(clusterNode);
				}
			})

		// Transition nodes to their new position.
		var nodeUpdate = node.transition()
			.duration(duration)
			.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });

		nodeUpdate.select("circle")
			.attr("r", 6)
			.style("fill", function(d) { return d._children ? "steelblue" : "#fff"; });


		// Transition exiting nodes to the parent's new position.
		var nodeExit = node.exit().transition()
			.duration(duration)
			.attr("transform", function(d) { return "translate(" + source.x + "," + source.y + ")"; })
			.remove();

		nodeExit.select("circle")
			.attr("r", 1e-6);

		// Update the links…
		var link = svg.selectAll("path.link")
			.data(links, function(d) { return d.target.id; });

		// Enter any new links at the parent's previous position.
		link.enter().insert("path", "g")
			.attr("class", "link")
			.attr("d", function(d) 
			{
				var o = {x: source.x0, y: source.y0};
				return diagonal({source: o, target: o});
			})
			.style("stroke-width", function(d) 
			{
				var t = d.target.members.length / treeVis.maxClusterMembership;
				if (!d.source.links)
					d.source.links = [this];
				else
					d.source.links.push(this);
				return (t *(MAX_THICKNESS - MIN_THICKNESS) + MIN_THICKNESS) + "px";
			});

		// Transition links to their new position.
		link.transition()
			.duration(duration)
			.attr("d", diagonal);

		// Transition exiting nodes to the parent's new position.
		link.exit().transition()
			.duration(duration)
			.attr("d", function(d) 
			{
				var o = {x: source.x, y: source.y};
				return diagonal({source: o, target: o});
			})
			.remove();

		// Stash the old positions for transition.
		nodes.forEach(function(d) {
			d.x0 = d.x;
			d.y0 = d.y;
		});
	}

	// Toggle children on click.
	function removeLinks(cluster)
	{
		if (cluster.links) {
			var children = cluster.getChildren();
			removeLinks(children[0]);
			removeLinks(children[1]);
			cluster.links = undefined;
		}

	}

	function expandNode(d) 
	{
		if (d.children) {
			d._children = d.children;
			d.children = null;
			removeLinks(d);
		} 
		else 
		{
			d.children = d._children;
			d._children = null;
		}
		update(d);
	}
}

LensTreeVis.prototype.visualize = function(depthCull, sizeCull)
{
	this.layout(this.clusters, 0, 0, depthCull);
	this.plot(this.clusters, 0, depthCull, sizeCull);	
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

LensTreeVis.prototype.plot = function(cluster, depth, depthCull, sizeCull)
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

	if (
		cluster.children
		&& (!depthCull || depth < depthCull)
		//&& (!sizeCull  || cluster.members.length >= sizeCull)
	)
	{
		// append an invisible rectangle for events
		var c1 = this.plot(cluster.children[0], depth+1, depthCull, sizeCull);
		var c2 = this.plot(cluster.children[1], depth+1, depthCull, sizeCull);

		// attach my cluster
		lensGroup = cluster.lens.visualize(this.group);
		var x = (c1[0] + c2[0]) / 2 - b[0]/2;
		var y = lensTree.depth * (b[1]+TREE_PADDING_V);
		lensGroup.attr("transform", "translate(" + x + "," + y + ")");

		// attach curves
		var s = [x+b[0] / 2, y + b[1]];
		var c1Thickness = (cluster.children[0].members.length / this.maxClusterMembership)*(MAX_THICKNESS - MIN_THICKNESS) + MIN_THICKNESS;
		var c2Thickness = (cluster.children[1].members.length / this.maxClusterMembership)*(MAX_THICKNESS - MIN_THICKNESS) + MIN_THICKNESS;
	
		var b1 = this.group.append("path")
			.attr("d", makeCurve(s, c1))
			.style("stroke", PATH_COLOR)
			.style("stroke-width", c1Thickness + "px")
			.style("fill", "none");

		var b2 = this.group.append("path")
			.attr("d", makeCurve(s, c2))
			.style("stroke", PATH_COLOR)
			.style("stroke-width", c2Thickness + "px")
			.style("fill", "none");
		
		cluster.lensTree.branches = [b1, b2];
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

	// register brush events
	(function(thisCluster, lens, brush, unbrush) 
	{
		if (brush) {
			lens.on("mouseover", function() {
				brush(thisCluster); 
			});
		}
		if (unbrush) {
			lens.on("mouseout", function() { 
				unbrush(thisCluster); 
			});
		}
	})(cluster, lensGroup, this.brushCallback, this.unbrushCallback);

	return ret;
}

LensTreeVis.prototype.highlightBranch = function(cluster, hColor)
{
	if (cluster.children && cluster.lensTree && cluster.lensTree.branches) 
	{
		cluster.lensTree.branches[0].style("stroke", hColor);
		cluster.lensTree.branches[1].style("stroke", hColor);
		this.highlightBranch(cluster.children[0], hColor);
		this.highlightBranch(cluster.children[1], hColor);
	}
}

LensTreeVis.prototype.unhighlightBranch = function(cluster)
{
	this.highlightBranch(cluster, PATH_COLOR);
}


