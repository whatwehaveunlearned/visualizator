var BAR_WIDTH = 10;			// width of a single bar, in pixels
var CELL_W = 23*1.5;
var CELL_H = 25/2*1.9;
var PADDING_V = 0; //5/2;
var PADDING_H = 0; //5/2;
var LENS_COLOR = "#555555";

function Histogram(theData, w, h, chartGroup, dataMax)
{
	this.data = theData;
	this.chartGroup = chartGroup;

	// find maximum value in the chart
	this.yMax = dataMax ? dataMax : d3.max( theData );	
	
	var bins = theData.length;
	var spaceForBars = bins * BAR_WIDTH;
	var outterPadding = spaceForBars < w ? ((w - spaceForBars) / 2) / spaceForBars : 0;
	outterPadding = Math.min(1, Math.max(0, outterPadding));

	var xScale, yScale;

	xScale = d3.scale.ordinal().domain(d3.range(bins)).rangeRoundBands([0, w], 0, outterPadding);
	yScale = d3.scale.linear().domain([0, this.yMax]).range([h, 0]);
	
	var updateSelection = chartGroup.selectAll("rect").data(theData);
	updateSelection.enter().append("rect").classed("histogramBar", true)
		.attr("x", function(d, i) { return xScale(i)})
		.attr("y", function(d, i) { return h})
		.attr("width", xScale.rangeBand() + "px")
		.attr("height", "0px")
		.style("fill", LENS_COLOR);

	updateSelection //.transition().duration(300)
		//.attr("x", function(d, i) { return xScale(i)})
		.attr("y", function(d, i) { return yScale(d)})
		.attr("width", xScale.rangeBand() + "px")
		.attr("height", function(d, i) { return h-yScale(d) + "px"});

	/*
	// make axes
	var xScaleAxis, yScaleAxis;
	var xAxis = d3.svg.axis();
	var yAxis = d3.svg.axis();
	var r = d3.range(0, this.dataMax+1, this.dataMax / bins);
	xAxis.scale(xScaleAxis).orient("bottom").ticks(bins).tickValues(r).tickSize(4);
	yAxis.scale(yScale).orient("left").ticks(5).tickSize(4);

	// remove existing axes if any
	d3.select("#" + this.chartName + "_axes").remove();
	var axesGroup = chartGroup.append("g").attr("id", this.chartName + "_axes");

	axesGroup.append("g").attr("class", "axis").attr("transform", "translate(0, " + h + ")").call(xAxis);
	axesGroup.append("g").attr("class", "axis").call(yAxis);

	axesGroup.append("text")
		.attr("text-anchor", "middle")
		.attr("x", w/2)
		.attr("y", h+CELL_PADDING-5)
		.classed("axisText", true)
		.style("font-size", "7px")
		.text(dimension + " (" + dInfo.unit + ")")
		.on("dblclick", function() { gridCell.updateAxis("x", null);});
	*/
}
Histogram.prototype.remove = function()
{
	chartGroup.remove();
}


/* ==============================================
 * Charts and VisualFeature
 * ==============================================
 */
var DEFAULT_CHARTS = 
[
		
		{
			label: "Races",
			type: "histogram",
			variables: [
				"P0060002",
				"P0060003",
				"P0060005",
				"P0040003"
			]
		},
		/*
		{
			label: "Male age distribution",
			type: "histogram",
			variables: [
				"P0120003",		// male under 5
				"P0120004",		// male 5-9
				"P0120005",
				"P0120006",
				"P0120007",
				"P0120008",
				"P0120009",
				"P0120010",
				"P0120011",
				"P0120012",
				"P0120013",
				"P0120014",
				"P0120015",
				"P0120016",
				"P0120017",
				"P0120018",
				"P0120019",
				"P0120020",
				"P0120021",
				"P0120022",
				"P0120023",		// male 75-79
				"P0120024",		// male 80-84
				"P0120025"		// male 85 and over
			]
		},
		*/
		
		{
			label: "Female age distribution",
			type: "histogram",
			variables: [
				"P0120027",		// female under 5
				"P0120028",		// female 5-9
				"P0120029",
				"P0120030",
				"P0120031",
				"P0120032",
				"P0120033",
				"P0120034",
				"P0120035",
				"P0120036",
				"P0120037",
				"P0120038",
				"P0120039",
				"P0120040",
				"P0120041",
				"P0120042",
				"P0120043",
				"P0120044",
				"P0120045",
				"P0120046",
				"P0120047",		// female 75-79
				"P0120048",		// female 80-84
				"P0120049"		// female 85 and over
			]
		}
		

];

function VisualFeature(chartSpecs, chartData)
{

	this.data = [];
	this.dataMax = Number.MIN_VALUE;
	this.dataMin = Number.MAX_VALUE;
	
	if (chartSpecs === undefined || chartSpecs === null) 
	{
		return;	
	}

	for (var i = 0, len = chartSpecs.variables.length; i < len; i++) 
	{
		var d = +chartData[ chartSpecs.variables[i] ];
		this.data.push(d);
		
		if (this.dataMax < d) 
		{
			this.dataMax = d;
		}

		if (this.dataMin > d) 
		{
			this.dataMin = d;
		}
	}

	if (chartSpecs.type == "histogram")
	{
		for (var i = 0, len = this.data.length; i < len; i++) {
			this.data[i] /= this.dataMax;
		}
		this.featureType = "histogram";
	}
}

VisualFeature.prototype.add = function(other)
{
	var feature = new VisualFeature();
	for (var i = 0, len = this.data.length; i < len; i++) 
	{
		feature.data.push( this.data[i] + other.data[i] );
	}
	return feature;
}

VisualFeature.prototype.distance = function(other) 
{
	var d = 0;
	for (var i = 0, len = this.data.length; i < len; i++)
	{
		var dd = this.data[i] - other.data[i];
		d += dd * dd;
	}
	return Math.sqrt(d);
}

VisualFeature.prototype.normalize = function()
{
	var dataMax = d3.max(this.data);
	for (var i = 0, len = this.data.length; i < len; i++) 
	{
		this.data[i] /= dataMax;
	}
	this.dataMax = dataMax;
}

VisualFeature.prototype.getDataMax = function() 
{
	return this.dataMax;
}

function VisualLens()
{
	this.features = [];
}
VisualLens.prototype.addFeature = function(feature) 
{
	this.features.push(feature)
}

VisualLens.prototype.distance = function(other)
{
	var combinedDistance = 0;
	var len = this.features.length;
	for (var i = 0; i < len; i++)
		combinedDistance += this.features[i].distance(other.features[i]);
	return len > 0 ? combinedDistance / len : 0;
}

VisualLens.prototype.aggregate = function(other)
{
	var agg = new VisualLens();
	for (var i = 0, len = this.features.length; i < len; i++) 
	{
		agg.features.push( this.features[i].add(other.features[i]) );
	}
	agg.featureType = this.featureType;
	return agg;
}

VisualLens.prototype.normalize = function()
{
	for (var i = 0, len = this.features.length; i < len; i++) {
		this.features[i].normalize();
	}
}

VisualLens.prototype.visualize = function(svg)
{
	this.unvisualize();
	
	var featureLen = this.features.length;	
	this.vis = {
		group: svg ? svg.append("g") : d3.select(document.createElement("g")),
		charts: []
	};
	
	var bounds = this.getBounds();

	this.vis.group.append("rect")
		.attr("width", CELL_W * bounds[2] + (bounds[2] > 1 ? (bounds[2]-1)*PADDING_H : 0))
		.attr("height", CELL_H * bounds[3] + (bounds[3] > 1 ? (bounds[3]-1)*PADDING_V : 0))
		.attr("x", "0")
		.attr("y", "0")
		.style("fill", "white");
	
	var cols = Math.ceil(Math.sqrt(featureLen));
	for (var i=0; i < featureLen; i++)
	{
		var row = Math.floor(i / cols);
		var col = i % cols;
		var x = (CELL_W+PADDING_H) * col;
		var y = (CELL_H+PADDING_V) * row;

		var feature = this.features[i];
		var chartGroup = this.vis.group.append("g")
			.attr("transform", "translate(" + x + "," + y + ")");
		var histogram = new Histogram(feature.data, CELL_W, CELL_H, chartGroup, 1);
		this.vis.charts.push(histogram);
	}
	return this.vis.group;
}

VisualLens.prototype.highlight = function(highlightColor)
{
	if (this.vis) {
		this.vis.group.select("rect").style("fill", highlightColor);
	}
}
VisualLens.prototype.unhighlight = function(highlightColor)
{
	if (this.vis) {
		this.vis.group.select("rect").style("fill", "white");
	}
}

VisualLens.prototype.getBounds = function()
{
	var cols = Math.ceil(Math.sqrt(this.features.length));
	var rows = Math.ceil(this.features.length / cols);
	var w = cols * CELL_W + (cols > 1 ? (cols-1) * PADDING_H : 0);
	var h = rows * CELL_H + (rows > 1 ? (rows-1) * PADDING_V : 0);

	return [w, h, cols, rows];
}

VisualLens.prototype.unvisualize = function()
{
	if (this.vis) {
		this.vis.group.remove();
	}
	this.vis = undefined;
}
/* ==============================================
 * LensGrid
 * ==============================================
 */


function LensGrid(svg, mapProjection, lensOffsetX, lensOffsetY, charts)
{
	this.selection = [];
	this.selectionMap = d3.map();

	this.svg = svg;
	this.toplevelGroup = svg.append("g");
	this.mapProjection = mapProjection;
	this.lensOffset = [lensOffsetX ? lensOffsetX : 0, lensOffsetY ? lensOffsetY : 0];

	// these are the mini charts that we will display in each cell
	this.charts = charts ? charts : DEFAULT_CHARTS;
}

LensGrid.prototype.updateOffset = function(xOffset, yOffset)
{
	this.lensOffset = [xOffset, yOffset];
}

LensGrid.prototype.getToplevelGroup = function()
{
	return this.toplevelGroup;
}

LensGrid.prototype.addCounty = function(countyNum, stateAbbr, countyPath, _countyCallback, variables)
{
	var geoid = +(getStateNumber(stateAbbr) + "" + countyNum);

	var existingSelection = this.selectionMap.get(geoid);
	if (existingSelection)
	{
		// already selected, do nothing
		existingSelection.countyPath.style("fill", "red");
		existingSelection.countyPath.transition().style("fill", LENS_COLOR);
		return;
	}
	

	// figure the bounds
	(function(thisLens, theVariables) 
	{
	
		if (!theVariables)
		{
			// make the charts
			var q = queue(1);
			var cq = new CensusQuery();

			for (var c=0; c < thisLens.charts.length; c++)
			{
				var chart = thisLens.charts[c];
				var chartVariables = chart.variables;
				q.defer(function(theVars, _stateAbbr, _countyNum, _callback) 
				{
					cq.getCounties(_callback, theVars, _stateAbbr, _countyNum)
				 }, chartVariables, stateAbbr, countyNum);
			}
			q.awaitAll(resultsReady)
		}
		else
		{
			resultsReady(null, theVariables);
		}

		function resultsReady(error, results)
		{
			if (error)
			{
				console.warn("\t error: " + error + ", results: " + (error ? " ERRORED " : results.length));
				return;
			}

			var rowNum = thisLens.selection.length;
			var group = thisLens.toplevelGroup.append("g")
				.attr("id", "row_group_" + geoid)
				.attr("transform", "translate(0," + rowNum * (CELL_H + PADDING_V) + ")");

			var lensRow = {
				rowNum: rowNum,
				charts: [],
				group: null,
				countyGroup: null
			};
			thisLens.selection.push( lensRow );

			// add a representation of the county
			if (countyPath)
			{
				if (!thisLens.pathGenerator)
					thisLens.pathGenerator = d3.geo.path(d3.geo.albersUsa().translate([0,0]));
				var bounds = thisLens.pathGenerator.bounds(countyPath);
				var countyLen = [bounds[1][0]-bounds[0][0], bounds[1][1]-bounds[0][1]];
				var countyScale = Math.min(CELL_W / countyLen[0], CELL_H / countyLen[1]);
				var scaledCountyLen = [countyScale*countyLen[0], countyScale*countyLen[1]];

				var countyGroup = group.append("g")
					.attr("id", "county_group_" + geoid)
					.attr("transform", "translate(" + (CELL_W-scaledCountyLen[0])/2 + "," + (CELL_H-scaledCountyLen[1])/2 + ") " +
						"scale(" + countyScale + "," + countyScale + ") " + 
						"translate(-"+bounds[0][0]+",-"+bounds[0][1]+")");

				lensRow.countyPath = countyGroup.append("path")
					.attr("id", "selection_county_" + geoid)
					//.style("fill", "red")
					.style("fill", LENS_COLOR)
					.style("stroke", "white")
					.attr("d", thisLens.pathGenerator(countyPath));
			}

			if (thisLens.mapProjection)
			{
				group
					.on("mouseover", function()
					{
						var geoid = d3.select(this).attr("id").split("_")[2];
						thisLens.addSelectionLink(geoid);
					})
					.on("mouseout", function()
					{
						var geoid = d3.select(this).attr("id").split("_")[2];
						thisLens.removeSelectionLink(geoid);
					});
			}

			// append all chart groups
			lensRow.group = group;
			lensRow.countyGroup = countyGroup;

			for (var c=0; c < thisLens.charts.length; c++)
			{
				var chart = thisLens.charts[c];
				var chartGroup = group.append("g")
					.attr("transform", "translate(" + (CELL_W+PADDING_H)*(c+(countyPath ? 1 : 0)) + ",0)");

				var chartData = [];
				var chartResults = results[c][0];
				for (var d=0, len=chart.variables.length; d<len; d++) 
				{
					var varName = chart.variables[d];
					var varValue = chartResults[varName];
					chartData.push(+varValue);
				}
				
				var histogram = new Histogram(chartData, CELL_W, CELL_H, chartGroup);
				lensRow.charts.push(histogram);
			}
			thisLens.selectionMap.set( geoid, lensRow );
			if (_countyCallback) _countyCallback();
		}
	})(this, variables);
}

LensGrid.prototype.getBounds = function()
{
	var rows = this.selection.length;
	var width = this.charts.length + (this.countyPath ? 1 : 0);

	return [
		width * CELL_W + (width > 0 ? width-1 : 0) * PADDING_H,
		rows  * CELL_H + (rows > 0 ? rows-1 : 0)   * PADDING_V
	];
}

// removes all existing counties in this lens
LensGrid.prototype.clear = function()
{
	this.toplevelGroup.remove();
	this.toplevelGroup = this.svg.append("g");
	this.selection = [];
	this.selectionMap = d3.map();
}

LensGrid.prototype.addSelectionLink = function(geoid)
{
	var s = this.selectionMap.get(geoid);
	if (s)
	{
		var feature = featureMap.get(geoid);
		d3.select("#selection_county_" + geoid).style("fill", "red");

		var countyCentroid = this.mapProjection.centroid(feature);
		var cellCoordinates = [this.lensOffset[0], this.lensOffset[1] + s.rowNum * (CELL_H+PADDING_V)+CELL_H/2];
		//console.log("centroid: " + countyCentroid + ", cell: " + cellCoordinates);

		// draw a linke between the two
		var gg = d3.select("#brushes").append("g")
			.attr("id", "county_link_" + geoid);

		gg.append("line")
			.style("stroke", "black")
			.style("stroke-width", "1px")
			.attr("x1", countyCentroid[0])
			.attr("y1", countyCentroid[1])
			.attr("x2", cellCoordinates[0])
			.attr("y2", cellCoordinates[1]);

		gg.append("circle")
			.attr("cx", countyCentroid[0])
			.attr("cy", countyCentroid[1])
			.attr("r", "3px")
			.style("fill", "black")
			.style("stroke", "none"); 
		this.selectionGroup = gg;
	}
}

LensGrid.prototype.removeSelectionLink = function(geoid)
{
	if (this.selectionGroup)
	{
		if (!geoid) 
			geoid = this.selectionGroup.attr("id").split("_")[2];
		this.selectionGroup.remove();
		this.selectionGroup = null;

		d3.select("#selection_county_"+geoid).style("fill", LENS_COLOR);
	}
}

/*
LensGrid.prototype.remove = function(geoid) {
	var selection = this.selectionMap.get(geoid);
}
*/