var SIMMAT_ELEMENT_SIZE = 20;
var SIMMAT_ELEMENT_BORDER = "#eeeeee";
var MATRIX_COLOR_SCALE = ['rgb(215,48,39)','rgb(252,141,89)','rgb(254,224,144)','rgb(255,255,191)','rgb(224,243,248)','rgb(145,191,219)','rgb(69,117,180)'].reverse();
var DENDOGRAM_NODE_HEIGHT = SIMMAT_ELEMENT_SIZE/2;
var DENDOGRAM_COLOR = "#959595";

function SimilarityMatrix(_svg, _floatingLenses)
{
	this.svg = _svg;
	this.offset = [0, 0];
	this.clusterBrushCallback = null;
	this.clusterUnbrushCallback = null;
	this.floatingLenses = _floatingLenses;

	this.matrixVisibility = true;
	this.dendogramVisibility = true;
	this.translateMatrix = false;
}

SimilarityMatrix.prototype.drawToCanvas = function(canvas, maxElements, fullMatrix)
{
	// render half of the matrix only
	var simMatrix = this.clusteredMatrix ? this.clusteredMatrix : this.matrix;
	var matrixLen = maxElements ? Math.min(maxElements, simMatrix.length) : simMatrix.length;
	var ctx = canvas.getContext("2d");
	var colorScale = d3.scale.quantize().domain([this.minSimilarity,1]).range(MATRIX_COLOR_SCALE);

	var y = 0;
	for (var i = 0; i < matrixLen; i++) 
	{
		var fence = fullMatrix ? matrixLen : i;
		var x = 0;
		y += SIMMAT_ELEMENT_SIZE;

		for (var j = 0; j < fence; j++, x += SIMMAT_ELEMENT_SIZE) 
		{
			ctx.fillStyle = colorScale(simMatrix[i][j]);
			ctx.fillRect(x, y, SIMMAT_ELEMENT_SIZE, SIMMAT_ELEMENT_SIZE);
		}
	}
}

SimilarityMatrix.prototype.draw = function()
{
	var transform = null;
	var brushCode = this.brushGroup ? this.brushGroup.html() : "";
	var simMatrix = this.clusteredMatrix ? this.clusteredMatrix : this.matrix;
	
	var colorScale = d3.scale.quantize().domain([this.minSimilarity,1]).range(MATRIX_COLOR_SCALE);
	
	if (this.matrixVisibility) 
	{
		(function(thisObject) {

			thisObject.g.selectAll("g").data(simMatrix).enter().append("g")
				.attr("transform", function(d, i) { return "translate(0," + (i*SIMMAT_ELEMENT_SIZE) + ")";})
				.selectAll("rect")
				.data(function(row, i) 
				{
					var theRow = [];
					for (var k=0, rowLen = row.length; k < rowLen; k++)
						theRow.push({ rowNum: i, data: row[k]});
					return theRow;
				})
					.enter().append("rect")
					.style("fill", function(d) { return colorScale(d.data);})
					.style("stroke-width", "0.5px")
					.style("stroke", SIMMAT_ELEMENT_BORDER)
					.attr("x", function(d, i) { return i*SIMMAT_ELEMENT_SIZE; })
					.attr("width", SIMMAT_ELEMENT_SIZE)
					.attr("height", SIMMAT_ELEMENT_SIZE)
					.on("mouseover", function(d, j) 
					{
						if (thisObject.floatingLenses)
							thisObject.floatingLenses.brushBoxes([ thisObject.ij2data[d.rowNum], thisObject.ij2data[j] ]);
					})
					.on("mouseout", function(d, i) 
					{
						if (thisObject.floatingLenses)
							thisObject.floatingLenses.unbrushBoxes();
					});
		})(this);

		if (this.translateMatrix) {
			this.g.attr("transform", "translate(" + (+this.svg.attr("width")-SIMMAT_ELEMENT_SIZE*simMatrix.length+this.offset[0]) + "," + this.offset[1]+")");
		}
	}
	else 
	{
		if (this.translateMatrix) {
			this.g.attr("transform", "translate(" + (+this.svg.attr("width")) + "," + this.offset[1]+")");
		}
	}

	
	this.brushGroup = this.g.append("g").attr("id", "matrixBrush").html(brushCode);
}


// *****************************************
// Cluster
// -----------------------------------------
var CLUSTER_ID = 1;

function Cluster(members)
{
	this.members = members;
	this.clusterID = CLUSTER_ID++;
	this.linkColor = null;
	this.nodeColor = null;
	this.selected = null;
}

Cluster.prototype.getID = function() {
	return this.clusterID;
}

Cluster.prototype.getParent = function()
{
	return this.parent;
}

Cluster.prototype.getChildren = function() 
{
	if (this._children) {
		return this._children;
	} else {
		return this.children;
	}
}

Cluster.prototype.getMembers = function()
{
	return this.members;
}

Cluster.prototype.isExpanded = function()
{
	return this.children || !this._children;
}


Cluster.prototype.restoreChildrenColor = function(passedDown)
{

	if (this.nodeColor) 
	{
		this.highlightNode(this.nodeColor);
		passedDown = this.nodeColor;
	}
	else if (passedDown === "") 
	{
		passedDown = this.resolveColor();
	}
	this.linkColor = passedDown;
	
	if (this.children) 
	{
		this.children[0].restoreChildrenColor(passedDown);
		this.children[1].restoreChildrenColor(passedDown);
		this.links[0].style("stroke", this.linkColor);
		this.links[1].style("stroke", this.linkColor);
	}

	if (this.lens.vis)
		this.lens.vis.rect.style("stroke", this.linkColor);
}

Cluster.prototype.expand = function()
{
	if (this._children) 
	{
		this.children = this._children;
		this._children = null;
	}
}

Cluster.prototype.resolveColor = function()
{
	if (this.nodeColor) {
		return this.nodeColor;
	}
	else
	{
		var nodeColor = this.nodeColor;
		var parent = this.getParent();
		while (parent && !nodeColor) {
			nodeColor = parent.nodeColor;
			parent = parent.getParent();
		}
		return nodeColor;
	}
}

Cluster.prototype.getLinkColor = function()
{
	return this.linkColor;
}

Cluster.prototype.getNodeColor = function()
{
	return this.nodeColor;
}

Cluster.prototype.highlightNode = function(color) 
{
	if (this.lens) 
	{
		this.lens.highlight(color ? color : this.nodeColor ? this.nodeColor : "white");
		if (this.lens.vis)
			this.lens.vis.rect.style("stroke", color ? color : this.nodeColor);
	} 
}

Cluster.prototype.toggleNode = function() 
{
	if (this.children) 
	{
		// collapse node and remove its links
		this._children = this.children;
		this.children = null;
		this.removeLinks();
	}
	else 
	{
		this.children = this._children;
		this._children = null;
		this.expand();
	}
}

Cluster.prototype.isSelected = function() 
{
	return this.selected == true;
}

Cluster.prototype.toggleSelection = function(selectionColor)
{
	if (this.selected) 
	{
		// de-activate 
		this.selected = false;
		this.nodeColor = null;		
		this.highlightNode(undefined);
		this.recursiveSetLinkColor(this.resolveColor());
	}
	else
	{
		this.selected = true;
		this.nodeColor = selectionColor;		
		this.highlightNode(selectionColor)
		
		this.linkColor = selectionColor;
		if (this.children) {
			this.children[0].recursiveSetLinkColor(selectionColor);
			this.children[1].recursiveSetLinkColor(selectionColor);
		}
	}
}

Cluster.prototype.recursiveSetLinkColor = function(linkColor)
{
	if (this.nodeColor) {
		return;
	}

	if (this.children) 
	{
		if (this.links) {
			this.links[0].style("stroke", linkColor);
			this.links[1].style("stroke", linkColor);
		}
		this.children[0].recursiveSetLinkColor(linkColor);
		this.children[1].recursiveSetLinkColor(linkColor);
	}
	this.linkColor = linkColor;

	if (this.lens.vis)
		this.lens.vis.rect.style("stroke", linkColor);

}

Cluster.prototype.removeLinks = function()
{
	if (this.links) 
	{
		this.links[0].remove();
		this.links[1].remove();
		this.links = undefined;

		var children = this.getChildren();
		children[0].removeLinks();
		children[1].removeLinks();
	}
}


Cluster.prototype.recursiveBrush = function(color, strokeWidth, linkColor)
{
	if (this.children) 
	{
		this.children[0].recursiveBrush(color, strokeWidth, linkColor);
		this.children[1].recursiveBrush(color, strokeWidth, linkColor);

		// color links
		if (this.links) {
			this.links[0].style("stroke", linkColor ? linkColor : this.linkColor ? this.linkColor : "");
			this.links[1].style("stroke", linkColor ? linkColor : this.linkColor ? this.linkColor : "");
		}
	}
	if (this.lens.vis) 
	{
		this.lens.vis.rect.style("stroke", linkColor ? linkColor : this.linkColor ? this.linkColor : "");
	}
}

Cluster.prototype.getLens = function()
{
	return this.lens;
}

Cluster.prototype.featurizeAll = function()
{
	if (this.lens) {
		this.lens.normalize();
		this.lens.featurize();
	}

	var children = this.getChildren();
	if (children) {
		children[0].featurizeAll();
		children[1].featurizeAll();
	}
}

Cluster.prototype.intraclusterVariability = function( clusterAccessor )
{
	if (this.intraclusterVar) {
		return this.intraclusterVar;
	}
	else {
		var centroid = this.lens;
		var all_variability = [];

		var features = this.lens.getFeatures();
		var featureCount = features.length;

		for (var f=0; f < featureCount; f++)
		{
			var variability = [];
			for (var i=0, len=this.members.length; i<len; i++) 
			{
				variability.push( features[f].distance( clusterAccessor(this.members[i]).lens.getFeature(f) ) );
			}
			all_variability.push( variability );
		}
		this.intraclusterVar = all_variability;
		return all_variability;
	}
}

Cluster.prototype.pairwiseVariability = function( clusterAccessor )
{
	if (this.pairwiseVar) {
		return this.pairwiseVar;
	}
	else
	{
		var all_variability = [];
		var featureCount = this.lens.getFeatures().length;

		for (var f=0; f < featureCount; f++)
		{
			var variability = [];
			for (var i=1, len=this.members.length; i<len; i++) 
			{
				for (var j=0; j<i; j++) 
				{
					var fI = clusterAccessor(this.members[i]).lens.getFeature(f);
					var fJ = clusterAccessor(this.members[j]).lens.getFeature(f);
					variability.push( fI.distance(fJ) );
				}
			}
			all_variability.push( variability );
		}
		this.pairwiseVar = all_variability;
		return all_variability;
	}
}

// *****************************************
// SimilarityMatrix
// -----------------------------------------

SimilarityMatrix.prototype.clusterMatrix = function()
{
	function selectMin(distance)
	{
		var theMin = [1, 0];
		var minD = distance[1][0];
		for (var i = 2, len = distance.length; i < len; i++) 
		{
			for ( var j = 0; j < i; j++)
			{
				var d = distance[i][j];
				if (d < minD) 
				{
					minD = d;
					theMin = [i, j];
				}
			}
		}
		theMin.push(minD);
		return theMin;
	}

	// this assumes i is larger than j
	function removeTwoColumn(m, i, j)
	{
		for (var k = j+1, len = m.length; k < len; k++) 
		{
			if (k > i) {
				m[k].splice(i, 1);
			}
			m[k].splice(j, 1);
		}
	}

	// initialize cluster matrix at L=0 which shall contain the initial elements
	var entryClusters = d3.map();
	var clusterList = [];
	var clusterDistance = [];
	var lensAccessor = typeof this.lensAccessor === 'function' ? this.lensAccessor : null;

	var startTime = new Date();
	for (var i = 0, len = this.matrix.length; i < len; i++)
	{
		var C = new Cluster([i]);
		entryClusters.set(i, C);
		C.l = 0; 
		C.lens = lensAccessor ? lensAccessor(i) : undefined;

		clusterList.push( C );
		clusterDistance.push([]);
		for (var j = 0; j < i; j++)
		{
			// distance is inverse of similarity
			clusterDistance[i].push( 1.0 - this.matrix[i][j] );
		}
	}

	iteration = 1;
	while (clusterList.length > 1)
	{
		/*
		console.log("\t distance matrix BEFORE merge: ");
		for (var r=0, len=clusterDistance.length; r<len; r++) {
			var line = "\t\t" + "[" + r + "," + clusterDistance[r].length + "]: ";
			for (var s=0; s<r; s++) {
				line += (clusterDistance[r][s] === undefined ? "X.XXX" : clusterDistance[r][s].toFixed(3)) + "\t";
			}
			console.log(line);
		}
		*/

		// select two cluster of the lowest distance
		var merger = selectMin(clusterDistance);

		// combine the two lists
		var i = merger[0];
		var j = merger[1];

		// add a new row to clusterDistance to
		// reflect the distance to the new cluster
		var newDRow = [];
		for (var k = 0, len = clusterList.length-2; k < len; k++) 
		{
			// jump over i and j
			var m = k;
			if (m >= j) m++;
			if (m >= i) m++;

			var d1 = clusterDistance[Math.max(m,i)][Math.min(m,i)];
			var d2 = clusterDistance[Math.max(m,j)][Math.min(m,j)];
			
			// this new cluster's distance to m is the maximum of i & j
			newDRow.push(Math.max(d1, d2));
		}

		// remove two old columns
		removeTwoColumn(clusterDistance, i, j);

		// remove two old rows from distance matrix
		clusterDistance.splice(i, 1);
		clusterDistance.splice(j, 1);
		
		// add new line
		clusterDistance.push(newDRow);

		// remove old clusters from cluster list and add new one
		var c1 = clusterList.splice(i, 1)[0];
		var c2 = clusterList.splice(j, 1)[0];
		
		// add newly created cluster
		var newCluster = new Cluster([]);
		newCluster.l = iteration++;
		clusterList.push(newCluster);

		// mark parent / child relationship between newly formed clusters and its predecessors
		// larger clusters are placed first
		// merge by seniority (# of members)
		if (c1.members.length >= c2.members.length) 
		{
			newCluster.children = [c1, c2];
			newCluster.members = c1.members.concat(c2.members);
		}
		else 
		{
			newCluster.children = [c2, c1];
			newCluster.members = c2.members.concat(c1.members)
		}
		if (lensAccessor) {
			newCluster.lens = c1.lens.aggregate(c2.lens);
		}
		
		/*
		console.log("\t distance matrix AFTER merge: ");
		for (var r=0, len=clusterDistance.length; r<len; r++) {
			var line = "\t\t" + "[" + r + "," + clusterDistance[r].length + "]: ";
			for (var s=0; s<r; s++) {
				line += (clusterDistance[r][s] === undefined ? "X.XXX" : clusterDistance[r][s].toFixed(3)) + "\t";
			}
			console.log(line);
		}
		*/

		//console.log("\t merged " + i + ", " + j + ", distance: " + merger[2] + ", members: " + newCluster.members);
		c1.parent = newCluster;
		c2.parent = newCluster;
	}

	this.clusters = clusterList[0];
	this.entryClusters = entryClusters;

	// layout the matrix
	this.layoutMatrix(this.clusters, 0);
	this.layoutDendogram(this.clusters, 0);
	
	this.clusteredMatrix = [];
	for (var i=0, len=this.matrix.length; i < len; i++) 
	{
		var r = this.ij2data[i];
		this.clusteredMatrix.push([]);
		for (var j = 0; j < len; j++)
		{
			var c = this.ij2data[j];
			this.clusteredMatrix[i].push( this.matrix[r][c] );
		}
	}
	var endTime = new Date();
	var processTime = (endTime.getTime() - startTime.getTime())/1000;
	console.log("clustering took: " + processTime.toFixed(1) + " seconds.");
	return this.clusters;
}

SimilarityMatrix.prototype.getClusters = function() {
	return this.clusters;
}

SimilarityMatrix.prototype.getEntryClusters = function() {
	return this.entryClusters;
}

SimilarityMatrix.prototype.setDendogramEvents = function(_dendogramEvents)
{
	this.dendogramEvents = _dendogramEvents;
}

SimilarityMatrix.prototype.setLensAccessor = function(_lensAccessor) {
	this.lensAccessor = _lensAccessor;
}

SimilarityMatrix.prototype.brush = function(i)
{
	var matrixSize = this.getSize();
	if (matrixSize > 0)
	{
		// row
		if (i[0] !== undefined && i[0] !== null)
			d3.select("#matrixBrush").append("rect")
				.style("fill", "none")
				.style("stroke-width", "1px")
				.style("stroke", "red")
				.attr("x", "0")
				.attr("y", this.data2ij[i[0]] * SIMMAT_ELEMENT_SIZE)
				.attr("width", matrixSize * SIMMAT_ELEMENT_SIZE)
				.attr("height", SIMMAT_ELEMENT_SIZE);
			
		if (i[1] !== undefined && i[1] !== null)
			d3.select("#matrixBrush").append("rect")
				.style("fill", "none")
				.style("stroke-width", "1px")
				.style("stroke", "red")
				.attr("y", "0")
				.attr("x", this.data2ij[i[1]] * SIMMAT_ELEMENT_SIZE)
				.attr("height", matrixSize * SIMMAT_ELEMENT_SIZE)
				.attr("width", SIMMAT_ELEMENT_SIZE);
	}
}

SimilarityMatrix.prototype.brushCluster = function(cluster)
{
	if (this.floatingLenses) {
		this.floatingLenses.brushBoxes(cluster.members, true);
	}

	// determine ij extents
	var r = this.matrix.length;
	var s = -1;
	for (var k=0, len=cluster.members.length; k<len; k++)
	{
		var i = this.data2ij[cluster.members[k]];
		if (r > i) r=i;
		if (s < i) s=i;
	}

	// create a rectangular brush
	if (s >= r)
	{
		var rectSize = (s-r+1) * SIMMAT_ELEMENT_SIZE;
		var rectXY = r * SIMMAT_ELEMENT_SIZE;
		
		if (this.matrixVisibility)
		{
			this.brushGroup.append("rect")
				.attr("x", rectXY)
				.attr("y", rectXY)
				.attr("width", rectSize)
				.attr("height", rectSize)
				.attr("stroke", "black")
				.attr("stroke-width", "2px")
				.attr("fill", "none");
		}
	}
}

SimilarityMatrix.prototype.unbrushCluster = function()
{
	if (this.floatingLenses)
		this.floatingLenses.unbrushBoxes(true);
	if (this.matrixVisibility)
		this.brushGroup.html("");
}

SimilarityMatrix.prototype.unbrush = function()
{
	if (this.brushGroup)
		this.brushGroup.html("");
}

SimilarityMatrix.prototype.getSize = function()
{
	if (this.matrix)
		return this.matrix.length;
	else
		return 0;
}

SimilarityMatrix.prototype.setMatrixVisibility = function(v)
{
	this.matrixVisibility = v;
}

SimilarityMatrix.prototype.setDendogramVisibility = function(v)
{
	this.dendogramVisibility = v;
}

SimilarityMatrix.prototype.updateMatrix = function(matrix, _minSimilarity)
{
	this.matrix = matrix;
	this.minSimilarity = _minSimilarity;

	this.data2ij = [];
	this.ij2data = [];

	// direct mapping
	for (var i=0, len=this.matrix.length; i < len; i++)
	{
		this.data2ij[i] = i;
		this.ij2data[i] = i;
	}

	// cluster
	this.clusterMatrix();
	this.drawMatrix();
}

SimilarityMatrix.prototype.drawMatrix = function()
{
	if (this.g) 
	{
		this.g.remove();
	}

	// create an SVG group to put the matrix under
	this.g = this.svg.append("g");

	// draw the matrix
	if (this.matrixVisibility)
		this.draw();

	if (this.dendogramVisibility) 
	{
		if (this.dendogramGroup) 
		{
			this.dendogramGroup.remove();
			this.dendogramGroup = undefined;
		}
		this.dendogramGroup = this.g.append("g")
			.attr("transform", "translate(" + ((-this.clusters.dendogram.depth-.5)*DENDOGRAM_NODE_HEIGHT) + ",0)");
		this.drawDendogram(this.clusters, this.dendogramLimit)[0];
	}
}

// a depth first layout function
SimilarityMatrix.prototype.layoutMatrix = function(cluster, order)
{
	if (cluster.lens)
		cluster.lens.normalize();
	
	var children = cluster.getChildren();
	if (children)
	{
		// layout my children
		return this.layoutMatrix(children[1], this.layoutMatrix(children[0], order));
	}
	else
	{
		// has to be a single element
		this.data2ij[cluster.members[0]] = order;
		this.ij2data[order] = cluster.members[0];
		return order+1;
	}
}

SimilarityMatrix.prototype.highlightCluster = function(cluster, theColor)
{
	if (cluster.dendogram.lines)
		cluster.dendogram.lines.attr("stroke", theColor)
	if (cluster.dendogram.circle)
		cluster.dendogram.circle.attr("fill", theColor);

	// do my children
	var children = cluster.getChildren();
	if (children) 
	{
		this.highlightCluster(children[0], theColor);
		this.highlightCluster(children[1], theColor);
	}
}

SimilarityMatrix.prototype.unhighlightCluster = function(cluster)
{
	this.highlightCluster(cluster, DENDOGRAM_COLOR);
}

SimilarityMatrix.prototype.setClusterBrushCallback = function(brush, unbrush)
{
	this.clusterBrushCallback = brush;
	this.clusterUnbrushCallback = unbrush;
}
SimilarityMatrix.prototype.setClusterDblClickCallback = function(callback) {
	this.clusterDblClickCallback = callback;
}

SimilarityMatrix.prototype.drawDendogram = function(cluster, limit)
{
	// invert depth
	var overallDepth = this.clusters.dendogram.depth;
	var myX = (overallDepth - cluster.dendogram.depth) * DENDOGRAM_NODE_HEIGHT;
	var myY = cluster.dendogram.centroid * SIMMAT_ELEMENT_SIZE + SIMMAT_ELEMENT_SIZE/2;

	if (limit !== null && limit !== undefined && cluster.dendogram.depth <= limit)
		return [myX, myY];

	if (cluster.getChildren())
	{
		// append an invisible rectangle for events
		(function(thisCluster, thisMatrix, _myX)
		{
			var children = thisCluster.getChildren();
			var child1 = children[0];
			var child2 = children[1];

			var cc1 = [
				(overallDepth - child1.dendogram.depth) * DENDOGRAM_NODE_HEIGHT,
				child1.dendogram.centroid * SIMMAT_ELEMENT_SIZE + SIMMAT_ELEMENT_SIZE/2
			];

			var cc2 = [
				(overallDepth - child2.dendogram.depth) * DENDOGRAM_NODE_HEIGHT,
				child2.dendogram.centroid * SIMMAT_ELEMENT_SIZE + SIMMAT_ELEMENT_SIZE/2
			];

			var branchPlaceholder = thisMatrix.dendogramGroup.append("rect")

				.attr("x", _myX)
				.attr("y", cc1[1])
				.attr("width", (thisCluster.dendogram.depth) * DENDOGRAM_NODE_HEIGHT)
				.attr("height", cc2[1]-cc1[1])
				.attr("stroke", "none")
				.attr("fill", "rgba(255, 255, 255, 0.0)")
				.on("mouseover", function() 
				{
					if (thisMatrix.clusterBrushCallback) {
						thisMatrix.clusterBrushCallback(thisCluster);
					}
				})
				.on("mouseout", function() 
				{
					if (thisMatrix.clusterUnbrushCallback) {
						thisMatrix.clusterUnbrushCallback(thisCluster);
					}
				})
				.on("dblclick", function() {
					if (thisMatrix.clusterDblClickCallback) {
						thisMatrix.clusterDblClickCallback(thisCluster);
					}
				});

			if (thisMatrix.dendogramEvents) 
			{
				thisMatrix.dendogramEvents.forEach(function(eventName, __callback) 
				{
					branchPlaceholder.on(eventName, function() {
						__callback(thisCluster);
					});
				});
			}
				
		})(cluster, this, myX);
		
		// draw my children
		var children = cluster.getChildren()
		var c1 = this.drawDendogram(children[0], limit);
		var c2 = this.drawDendogram(children[1], limit);

		var lines = [
			{x1: myX, y1: c1[1], x2: c1[0], y2: c1[1]},
			{x1: myX, y1: c2[1], x2: c2[0], y2: c2[1]},
			{x1: myX, y1: c1[1], x2: myX, y2: c2[1]}
		];

		// connect my children with lines
		(function(thisCluster, thisMatrix) 
		{
			var g = thisMatrix.dendogramGroup.append("g");
			thisCluster.dendogram.lines = g.selectAll("line")
				.data(lines).enter().append("line")
				.attr("x1", function(d) { return d.x1} )
				.attr("y1", function(d) { return d.y1} )
				.attr("x2", function(d) { return d.x2} )
				.attr("y2", function(d) { return d.y2} )
				.attr("stroke", DENDOGRAM_COLOR)
				.attr("stroke-width", "1px");
		})(cluster, this);
	}
			
	return [myX, myY];
}

SimilarityMatrix.prototype.layoutDendogram = function(cluster, depth)
{
	var children = cluster.getChildren();
	if (children)
	{
		var c1 = this.layoutDendogram(children[0], depth);
		var c2 = this.layoutDendogram(children[1], depth);
		cluster.dendogram = {
			centroid: (c1.centroid + c2.centroid) / 2, 
			depth: Math.max(c1.depth, c2.depth)+1
		};
	}
	else
	{
		cluster.dendogram = {
			centroid: this.data2ij[cluster.members[0]],
			depth: depth
		};
	}
	return cluster.dendogram;


}

