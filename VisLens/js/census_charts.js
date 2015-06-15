var BAR_WIDTH = 10;			// width of a single bar, in pixels
var CELL_W = 39*1.5;
var CELL_H = 25/2*1.9;
var PADDING_V = 0; //5/2;
var PADDING_H = 0; //5/2;
var LENS_COLOR = "#555555";
var CHART_TRANSITION = 250;

// for featurization and simplification
var DEFAULT_ASPECT = 2;
var SIMPLIFICATION_TOLERANCE = 0.015;

function Linechart(theData, w, h, chartGroup, yMax)
{
	this.data = theData;
	this.chartGroup = chartGroup;

	this.yMax = yMax ? yMax : d3.max( theData );	

	var xScale = d3.scale.linear().domain([0, theData[theData.length-1][0]]).range([0, w]);
	var yScale = d3.scale.linear().domain([0, this.yMax]).range([h, 0]);

	this.yScale = yScale;
	this.xScale = xScale;

	var line = d3.svg.line()
		.x(function(d, i) { return xScale(d[0]); })
		.y(function(d, i) { return yScale(d[1]); });
	this.lineGenerator = line;
	this.theLine = chartGroup.append("path").datum(theData).attr("class", "line").attr("d", line);

}

Linechart.prototype.update = function(theData)
{
	this.theLine.datum(theData)
		.transition().duration(CHART_TRANSITION)
		.attr("d", this.lineGenerator);	
}

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
	this.xScale = xScale;
	this.w = w;
	this.h = h;

	xScale = d3.scale.ordinal().domain(d3.range(bins)).rangeRoundBands([0, w], 0, outterPadding);
	yScale = d3.scale.linear().domain([0, this.yMax]).range([h, 0]);
	this.yScale = yScale;
	
	var updateSelection = chartGroup.selectAll("rect").data(theData);
	updateSelection.enter().append("rect").classed("histogramBar", true)
		.attr("x", function(d, i) { return xScale(i)})
		.attr("y", function(d, i) { return h})
		.attr("width", xScale.rangeBand() + "px")
		.attr("height", "0px")
		.style("fill", LENS_COLOR);

	updateSelection //.transition().duration(CHART_TRANSITION)
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

Histogram.prototype.update = function(theData)
{
	//this.yMax = this.dataMax ? this.dataMax : d3.max( theData );
	var updateSelection = this.chartGroup.selectAll("rect").data(theData);
	var yScale = this.yScale;
	var h = this.h;

	updateSelection.transition().duration(CHART_TRANSITION)
		.attr("y", function(d, i) { return yScale(d)})
		.attr("height", function(d, i) { return h-yScale(d) + "px"});

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

/* ================================================
 *  VisualFeature
 * ------------------------------------------------
 */

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
	}

	if (chartSpecs.type == "histogram")
	{
		this.normalize();
		this.featureType = "histogram";
	}
}

VisualFeature.prototype.getFeatureType = function()
{
	return this.featureType;
}

VisualFeature.prototype.lowpassFilter = function(freq_cut1, freq_cut2)
{
	var cut1 = Math.floor( (this.data.length-1) * freq_cut1 );
	var cut2 = Math.ceil( (this.data.length-1) * freq_cut2 );

	var input = this.data;
	var output = this.data;

	// prepare a complex array
	var data = new complex_array.ComplexArray(input.length);
	data.map(function(value, i, n) { value.real = input[i]; });

	// compute FFT
	data.FFT();
						
	// lowpass filter
	data.map(function(freq, i, n) 
	{
		if (i < cut1 || i > cut2) 
		{
			freq.real = 0;
			freq.imag = 0;
		}
	});
						
	// inverse FFT
	data.InvFFT();

	// copy to putput
	data.map(function(value, i, n) { output[i] = value.real; });

	// normalize
	this.normalize();
}


VisualFeature.prototype.getNormalizedData = function()
{
	return this.data;
}

VisualFeature.prototype.featurize = function(aspect)
{
	if (!this.vFeature) 
	{
		if (!aspect) aspect = DEFAULT_ASPECT;
		this.aspect = aspect;
		this.vFeature = [];
		for (var i=0, len=this.data.length, lenMinus=this.data.length-1; i < len; i++) 
		{
			this.vFeature.push( [aspect * (i/lenMinus), this.data[i]] );
		}
		this.featureType = "featurized";
	}
	return this;
}

VisualFeature.prototype.computeSignature = function(tolerance)
{
	if (!this.vFeature) {
		this.featurize();
	}

	// calculate a simplified shape
	this.signature = DouglasPeucker(this.vFeature, 0, this.vFeature.length-1, tolerance ? tolerance : SIMPLIFICATION_TOLERANCE);
	
	return this;
}

VisualFeature.prototype.getSignature = function()
{
	if (!this.signature) {
		this.computeSignature();
	}
	return this.signature;
}
VisualFeature.prototype.getAspect = function()
{
	return this.aspect;
}

VisualFeature.prototype.replicate = function()
{
	var clone = new VisualFeature();
	clone.dataMin = this.dataMin;
	clone.dataMax = this.dataMax;
	clone.data = this.data.slice(0);
	clone.featureType = this.getFeatureType();
	return clone;
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
	var e = d3.extent(this.data);
	var dataMax = e[1];
	var dataMin = e[0];
	var diff = dataMax - dataMin;

	for (var i = 0, len = this.data.length; i < len; i++) 
	{
		this.data[i] = (this.data[i] - dataMin) / diff;
	}
	this.dataMax = dataMax;
	this.dataMin = dataMin;
}

VisualFeature.prototype.getDataMax = function() 
{
	return this.dataMax;
}

VisualFeature.prototype.getDataMin = function() 
{
	return this.dataMin;
}


/* ================================================
 *  Segment & DouglasPeucker
 * ------------------------------------------------
 */

function Segment(p1, p2)
{
	this.dy = p2[1] - p1[1];
	this.dx = p2[0] - p1[0];
	this.nominator = p2[0]*p1[1]-p2[1]*p1[0];
	this.denominator = Math.sqrt(this.dy * this.dy + this.dx * this.dx);
}

Segment.prototype.distanceToPoint = function(p)
{
	return Math.abs( this.dy*p[0] - this.dx*p[1] + this.nominator) / this.denominator;
}

function DouglasPeucker(points, r0, r1, tolerance)
{
	var index = r0;
	var dmax = 0;
	var segment = r0+1 <= r1-1 ? new Segment( points[r0], points[r1] ) : undefined;

	for (var i = r0+1, len=r1-1; i <= len; i++) 
	{
		var d = segment.distanceToPoint( points[i] );
		if (d > dmax) 
		{
			index = i;
			dmax = d;
		}
	}
	segment = undefined;

	if ( dmax > tolerance ) 
	{
		var recResults1 = DouglasPeucker(points, r0, index, tolerance); 
		var recResults2 = DouglasPeucker(points, index, r1, tolerance);	

		recResults1.pop();
		return recResults1.concat(recResults2);
	}
	else
	{
		return [ points[r0], points[r1] ];
	}
}

/* ================================================
 *  VisualLens
 * ------------------------------------------------
 */

function VisualLens()
{
	this.features = [];
	this.labels = [];
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

VisualLens.prototype.featurize = function(aspect)
{
	for (var i = 0, len = this.features.length; i < len; i++) {
		this.features[i].featurize(aspect);
	}
	return this;
}
VisualLens.prototype.makeTransparent = function(svg)
{
	if (this.vis)
		this.vis.rect.style("fill", "rgba(255, 255, 255, 0)");
}

VisualLens.prototype.visualize = function(svg, cellDimensions, padding)
{
	//this.unvisualize();
	
	var featureLen = this.features.length;	
	var vis = {
		group: svg ? svg.append("g") : d3.select(document.createElement("g")),
		charts: []
	};
	
	var bounds = this.getBounds();
	var cell_w = CELL_W, cell_h = CELL_H, padding_h = PADDING_H, padding_v = PADDING_V;

	if (cellDimensions) {
		cell_w = cellDimensions[0];
		cell_h = cellDimensions[1];
	}
	if (padding) {
		padding_h = padding[0];
		padding_v = padding[1];
	}

	vis.rect = vis.group.append("rect")
		.attr("width",  20 + cell_w * bounds[2] + (bounds[2] > 1 ? (bounds[2]-1) * padding_h : 0))
		.attr("height", 20 + cell_h * bounds[3] + (bounds[3] > 1 ? (bounds[3]-1) * padding_v : 0))
		.attr("x", "-10")
		.attr("y", "-10")
		.attr("rx", 10)
		.attr("ry", 10)
		.attr("class", "lensRect")
		.style("fill", "white");
			
	var cols = Math.ceil(Math.sqrt(featureLen));
	for (var i=0; i < featureLen; i++)
	{
		// figure out x/y offset of this chart within the lens
		var row = Math.floor(i / cols);
		var col = i % cols;
		var x = (cell_w + padding_h) * col;
		var y = (cell_h + padding_v) * row;

		// make a new SVG group, position it, and put the chart under it
		var chartGroup = vis.group.append("g").attr("transform", "translate(" + x + "," + y + ")");		
		vis.charts.push(this.makeChart(this.features[i], chartGroup, cellDimensions));
	}

	if (svg && !this.vis) {
		this.vis = vis;
	}
	return vis.group;
}

VisualLens.prototype.makeChart = function(feature, chartGroup, cellDimensions)
{
	var theChart;
	var cell_w = CELL_W, cell_h = CELL_H;

	if (cellDimensions) {
		cell_w = cellDimensions[0];
		cell_h = cellDimensions[1];
	}

	if (feature.getFeatureType() == "histogram") {
		theChart = new Histogram(feature.data, cell_w, cell_h, chartGroup, 1);
	}
	else if (feature.getFeatureType() == "featurized")
	{
		theChart = new Linechart(feature.getSignature(), cell_w, cell_h, chartGroup, 1);
	}
	return theChart;
}
VisualLens.prototype.redrawLens = function()
{
	if (this.vis)
	{
		for (var i=0, len=this.features.length; i < len; i++) {
			var feature = this.features[i];
			this.vis.charts[i].update(
				feature.getFeatureType() == "featurized" ? feature.getSignature() : 
				feature.getNormalizedData()
			);
		}
	}
}

VisualLens.prototype.highlight = function(highlightColor)
{
	if (this.vis) {
		this.vis.rect.style("fill", highlightColor);
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

VisualLens.prototype.replicate = function()
{
	var clone = new VisualLens();
	for (var i=0, len=this.features.length; i < len; i++) {
		clone.features.push( this.features[i].replicate() );
	}
	return clone;
}

VisualLens.prototype.addLabel = function(label)
{
	this.labels.push(label);
	return this;
}

VisualLens.prototype.getLabels = function()
{
	return this.labels;
}

VisualLens.prototype.getFeatures = function()
{
	return this.features;
}

VisualLens.prototype.getFeature = function(index)
{
	return this.features[index];
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