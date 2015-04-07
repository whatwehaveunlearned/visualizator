var SIMMAT_ELEMENT_SIZE = 20;
var SIMMAT_ELEMENT_BORDER = "#eeeeee";

function SimilarityMatrix(_svg)
{
	this.svg = _svg;
	this.offset = [0, 0];
}

SimilarityMatrix.prototype.draw = function(simMatrix)
{
	var transform = null;
	var brushCode = this.brushGroup ? this.brushGroup.html() : "";
	if (this.g) 
	{
		this.g.remove();
		
	}

	this.g = this.svg.append("g");
	
	var theColors = ['rgb(215,48,39)','rgb(252,141,89)','rgb(254,224,144)','rgb(255,255,191)','rgb(224,243,248)','rgb(145,191,219)','rgb(69,117,180)'].reverse();
	var colorScale = d3.scale.quantize().domain([this.minSimilarity,1]).range(theColors);
	
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
				.on("mouseover", function(d, j) {
					floatingLenses.brushBoxes([ thisObject.ij2data[d.rowNum], thisObject.ij2data[j] ]);
				})
				.on("mouseout", function(d, i) {
					floatingLenses.unbrushBoxes();
				});
	})(this);
	
	this.g.attr("transform", "translate(" + (+this.svg.attr("width")-SIMMAT_ELEMENT_SIZE*simMatrix.length+this.offset[0]) + "," + this.offset[1]+")");
	this.brushGroup = this.g.append("g").attr("id", "matrixBrush").html(brushCode);
}

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
		return theMin;
	}

	// this assumes i is larger than j
	function removeColumn(m, i, j)
	{
		for (var k = j+1, len = m.length; k < len; k++) 
		{
			if (k > i)
				m[k].splice(i, 1);
			m[k].splice(j, 1);
		}
	}

	// initialize cluster matrix at L=0 which shall contain the initial elements
	var clusterList = [];
	var clusterDistance = [];

	for (var i = 0, len = this.matrix.length; i < len; i++)
	{
		clusterList.push({l: 0, members: [i]});
		clusterDistance.push([]);
		for (var j = 0; j < i; j++)
		{
			clusterDistance[i].push( this.matrix[i][j] );
		}
	}

	iteration = 1;
	while (clusterList.length > 1)
	{
		// select two cluster of the lowest distance
		var merger = selectMin(clusterDistance);

		// combine the two lists
		var i = merger[0];
		var j = merger[1];

		var newCluster = 
		{ 
			members: clusterList[i].members.concat(clusterList[j].members), 
			l: iteration++
		};

		// add a new row to clusterDistance to
		// reflect the distance to the new cluster
		var newDRow = [];
		for (var k = 0, len = clusterList.length-2; k < len; k++) 
		{
			// jump over i and j
			var otherI = k + (k >= j ? 1 : 0) + (k >= i ? 1 : 0);

			var d1 = clusterDistance[Math.max(otherI,i)][Math.min(otherI,i)];
			var d2 = clusterDistance[Math.max(otherI,j)][Math.min(otherI,j)];
			newDRow.push(Math.max(d1, d2));
		}
		clusterDistance.push(newDRow);

		// remove two old columns
		removeColumn(clusterDistance, i, j);

		// remove two old rows
		clusterDistance.splice(i, 1);
		clusterDistance.splice(j, 1);

		// remove old clusters from cluster list and add new one
		var c1 = clusterList.splice(i, 1)[0];
		var c2 = clusterList.splice(j, 1)[0];
		
		// add newly created cluster
		clusterList.push(newCluster);

		// mark parent / child relationship between newly formed clusters and its predecessors
		// larger clusters are placed first
		if (c1.members.length >= c2.members.length) 
			newCluster.children = [c1, c2];
		else
			newCluster.children = [c2, c1];
		c1.parent = newCluster;
		c2.parent = newCluster;
	}

	this.clusters = clusterList[0];

	// layout the matrix
	layoutMatrix(this.clusters, 0, this.data2ij, this.ij2data );
	
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
	return clusterList[0];
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
				.style("stroke-width", "2px")
				.style("stroke", "red")
				.attr("x", "0")
				.attr("y", this.data2ij[i[0]] * SIMMAT_ELEMENT_SIZE)
				.attr("width", matrixSize * SIMMAT_ELEMENT_SIZE)
				.attr("height", SIMMAT_ELEMENT_SIZE);
			
		if (i[1] !== undefined && i[1] !== null)
			d3.select("#matrixBrush").append("rect")
				.style("fill", "none")
				.style("stroke-width", "2px")
				.style("stroke", "red")
				.attr("y", "0")
				.attr("x", this.data2ij[i[1]] * SIMMAT_ELEMENT_SIZE)
				.attr("height", matrixSize * SIMMAT_ELEMENT_SIZE)
				.attr("width", SIMMAT_ELEMENT_SIZE);
	}
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
	if (this.clusteredMatrix)
		this.draw(this.clusteredMatrix);
}

// a depth first layout function
function layoutMatrix(cluster, order, m2ij, ij2m)
{
	if (cluster.children)
	{
		// layout my children
		return layoutMatrix(cluster.children[1], layoutMatrix(cluster.children[0], order, m2ij, ij2m), m2ij, ij2m);
	}
	else
	{
		// has to be a single element
		m2ij[cluster.members[0]] = order;
		ij2m[order] = cluster.members[0];
		return order+1;
	}
}
