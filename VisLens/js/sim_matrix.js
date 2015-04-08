var SIMMAT_ELEMENT_SIZE = 20;
var SIMMAT_ELEMENT_BORDER = "#eeeeee";
var MATRIX_COLOR_SCALE = ['rgb(215,48,39)','rgb(252,141,89)','rgb(254,224,144)','rgb(255,255,191)','rgb(224,243,248)','rgb(145,191,219)','rgb(69,117,180)'].reverse();

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
	
	var colorScale = d3.scale.quantize().domain([this.minSimilarity,1]).range(MATRIX_COLOR_SCALE);
	
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
		theMin.push(minD);
		return theMin;
	}

	// this assumes i is larger than j
	function removeColumn(m, i, j)
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
			newDRow.push(Math.min(d1, d2));
		}

		// remove two old columns
		removeColumn(clusterDistance, i, j);

		// remove two old rows from distance matrix
		clusterDistance.splice(i, 1);
		clusterDistance.splice(j, 1);
		
		// add new line
		clusterDistance.push(newDRow);

		// remove old clusters from cluster list and add new one
		var c1 = clusterList.splice(i, 1)[0];
		var c2 = clusterList.splice(j, 1)[0];
		
		// add newly created cluster
		var newCluster = 
		{ 
			members: [], 
			l: iteration++
		};
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

	// layout the matrix
	this.layoutMatrix(this.clusters, 0);
	
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
SimilarityMatrix.prototype.layoutMatrix = function(cluster, order)
{
	if (cluster.children)
	{
		// layout my children
		return this.layoutMatrix(cluster.children[1], this.layoutMatrix(cluster.children[0], order));
	}
	else
	{
		// has to be a single element
		this.data2ij[cluster.members[0]] = order;
		this.ij2data[order] = cluster.members[0];
		return order+1;
	}
}
