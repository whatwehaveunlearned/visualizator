var BAR_WIDTH = 10;			// width of a single bar, in pixels
var CELL_W = 100;
var CELL_H = 100;
var PADDING_V = 10;
var PADDING_H = 50;

function Histogram(theData, w, h, chartGroup)
{
	this.data = theData;
	this.chartGroup = chartGroup;

	// find maximum value in the chart
	this.yMax = d3.max( theData );
	
	// frequency as multiple of 10
	//this.yMax = Math.ceil(this.frequencyMax / 10) * 10;

	var bins = theData.length;
	var spaceForBars = bins * BAR_WIDTH;
	var outterPadding = (w - spaceForBars) / 2;

	var xScale, yScale;

	xScale = d3.scale.ordinal().domain(d3.range(bins)).rangeRoundBands([0, w], 0, outterPadding);
	yScale = d3.scale.linear().domain([0, this.yMax]).range([h, 0]);
	
	var updateSelection = chartGroup.selectAll("rect").data(theData);
	updateSelection.enter().append("rect").classed("histogramBar", true)
		.attr("x", function(d, i) { return xScale(i)})
		.attr("y", function(d, i) { return h})
		.attr("width", xScale.rangeBand() + "px")
		.attr("height", "0px");

	updateSelection.transition().duration(300)
		.attr("x", function(d, i) { return xScale(i)})
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

function LensGrid()
{
	this.selection = [];
	this.selectionMap = d3.map();

	this.pathGenerator = d3.geo.path();

	// these are the mini charts that we will display in each cell
	this.charts = [
		{
			type: "histogram",
			variables: [
			]
		},
		{
			type: "histogram",
			variables: [
			]
		}
	];
}

LensGrid.prototype.addCounty = function(countyNum, countyPath)
{
	if (selectionMap.get(countyNum))
	{
		// already selected, do nothing
		return;
	}

	// figure the bounds
	var thisLens = this;


	// make the charts
	var q = queue(1);
	var cq = new CensusQuery();
	for (var c=0; c<this.charts.length; c++)
	{
		var chart = this.charts[c];
		q.defer(function(variables, callback) 
		{
			cq.getCounties(callback, variables, null, countyNum)
		}, chart.variables);
	}

	// wait for all the jobs to be finished
	q.awaitAll(function(error, results)
	{
		// make a cell
		var lensRow = {
			charts: [],
			group: null,
			countyGroup: null
		};

		var rowNum = thisLens.selection.length;
		var group = d3.select("#lensPlaceholder").append("g")
			.attr("transform", "translate(0," + rowNum * (CELL_H + PADDING_V) + ")");

		// add a representation of the county
		var bounds = this.pathGenerator.bounds(countyPath);
		var countyLen = [bounds[1][0]-bounds[0][1], bounds[1][1]-bounds[0][1]];
		var countyScale = Math.min(CELL_W / countyLen[0], CELL_H / countyLen[1]);
		var scaledCountyLen = [countyScale*countyLen[0], countyScale*countyLen[1]];
		var countyGroup = group.append("g")
			.attr("transform", "translate(" + (CELL_W-scaledCountyLen[0])/2 + "," + (CELL_H-scaledCountyLen[1])/2 + ") " +
				"scale(" + countyScale + "," + countyScale + ")");
		countyGroup.append("path")
			.style("fill", "black")
			.style("stroke", "none")
			.attr("d", thisLens.pathGenerator(countyPath));

		lensRow.group = group;
		lensRow.countyGroup = countyGroup;

		// append all chart groups
		for (var c=0; c < thisLens.charts.length; c++)
		{
			var chartGroup = group.append("g")
				.attr("transform", "translate(" + (CELL_W+PADDING_H)*c + ",0)");

			var data = [];
			for (var d=0, len=thisLens.charts[c].variables; d<len; d++) {
				var varName = thisLens.charts[c].variables[d];
				var varValue = results[c][varName];
				data.push(varValue);
			}

			var histogram = new Histogram(data, CELL_W, CELL_H, chartGroup);
			lensRow.charts.push(histogram);
		}
		thisLens.selection.push( lensRow );
	});
}

LensGrid.prototype.remove = function(rowNum) {
}