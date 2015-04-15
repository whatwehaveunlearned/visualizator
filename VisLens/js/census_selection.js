var TOLERANCE = 5;
var SELECTION_SERIAL = 1;
var SELECTION_BOX_COLOR = "rgba(145, 209, 255, 0.6)";
var SELECTION_BOX_COLOR_BRUSH = "rgba(255, 191, 145, 0.7)";

// maximum number of counties per lens grid
// there should be some criterion for selecting which
// counties will eventually make it to the grid, but for now
// it will be which ever county comes first
var MAX_GRID_SIZE = 5;


function SelectionBox(mouse, brushGroup)
{
	// a map to store image-based similarity with other lenses
	this.lensSimilarity = d3.map();

	this.new = true;
	this.id = SELECTION_SERIAL;
	SELECTION_SERIAL++;
	
	this.anchor = [mouse[0], mouse[1]];
	this.x = mouse[0];
	this.y = mouse[1];
	this.w = 0;
	this.h = 0;
	this.brushGroup = brushGroup;
	
	this.lensGroup = brushGroup.append("g");
	this.bgRect = this.lensGroup.append("rect")
		.attr("width", "0").attr("height", "0").attr("id", "selection_lens_rect_" + this.id)
		.style("stroke", "none").style("fill", "rgba(255, 255, 255, 0.7)")
	this.lensGrid = new LensGrid(this.lensGroup, pathGenerator, 0, 0);
	this.lensOffset = [0, 0];
}

SelectionBox.prototype.updateSize = function(mouse)
{
	var x1 = Math.min(this.anchor[0], mouse[0]);
	var x2 = Math.max(this.anchor[0], mouse[0]);

	var y1 = Math.min(this.anchor[1], mouse[1]);
	var y2 = Math.max(this.anchor[1], mouse[1]);

	this.x = x1;
	this.y = y1;
	this.w = x2-x1;
	this.h = y2-y1;
	var myId = this.id;

	// draw / update rectangle
	if (this.rect === undefined)
	{
		this.rect = this.brushGroup.append("rect")
			.style("stroke", "black")
			.style("stroke-width", "1px")
			.style("fill", SELECTION_BOX_COLOR)
			.attr("id", "selection_box_" + this.id);
			
			(function(thisBox) 
			{
				thisBox.rect.on("mouseover", function() 
				{
					thisBox.brush();
					floatingLenses.brushMatrix(thisBox.id);
				})
				.on("mouseout", function() 
				{
					thisBox.unbrush();
					floatingLenses.unbrushMatrix();
				})
				.on("dblclick", function()
				{
					thisBox.toggleLensVisibility();
				});
			})(this)
	}
	this.rect
		.attr("x", this.x)
		.attr("y", this.y)
		.attr("width", this.w)
		.attr("height", this.h);
}

SelectionBox.prototype.mousedown = function(mouse)
{

	this.mousedownCoord = [mouse[0], mouse[1]];
	this.pickLens = undefined;

	var xL = Math.abs(this.x-mouse[0]) <= TOLERANCE ? true : false;
	var xR = Math.abs(this.x+this.w-mouse[0]) <= TOLERANCE ? true : false;
	var yT = Math.abs(this.y-mouse[1]) <= TOLERANCE ? true : false;
	var yB = Math.abs(this.y+this.h-mouse[1]) <= TOLERANCE ? true : false;

	// mouse coordinate relative to the lense grid
	var lMouse = d3.mouse(this.bgRect.node());
	var lW = this.bgRect.attr("width");
	var lH = this.bgRect.attr("height");


	// first test the lens grid
	if (this.isLensVisible() && lMouse[0] >= 0 && lMouse[0] <= lW && lMouse[1] >= 0 && lMouse[1] <= lH)
	{
		this.pickLens = true;
	}

	// then see which part of the box are we picking, if any
	else if (xL && yT) {
		this.anchor = [this.x+this.w, this.y+this.h];
	}
	else if (xL && yB) {
		this.anchor = [this.x+this.w, this.y];
	}
	else if (xR && yT) {
		this.anchor = [this.x, this.y+this.h];
	}
	else if (xR && yB) {
		this.anchor = [this.x, this.y];
	}
	else if (this.x <= mouse[0] && this.y <= mouse[1] && this.x+this.w >= mouse[0] && this.y+this.h >= mouse[1])
	{
		this.anchor = undefined;
	}
	else
	{
		this.mousedownCoord = undefined;
		return false;
	}
	
	return true;
}

SelectionBox.prototype.mousemove = function(mouse)
{
	if (this.pickLens)
	{
		// move the lens
		this.moveLens(
			this.lensOffset[0] += mouse[0]-this.mousedownCoord[0],
			this.lensOffset[1] += mouse[1]-this.mousedownCoord[1]
		);
		this.mousedownCoord = [mouse[0], mouse[1]];	
	}
	else if (this.anchor) {
		this.updateSize(mouse);
		this.updated = true;
	}
	else
	{
		// move the entire box
		this.x += mouse[0]-this.mousedownCoord[0];
		this.y += mouse[1]-this.mousedownCoord[1];
		this.mousedownCoord = [mouse[0], mouse[1]];
		this.rect.attr("x", this.x).attr("y", this.y);
		this.updated = true;
	}
}

SelectionBox.prototype.updateIntersections = function(_masterCallback, _masterParameter)
{
	var l = this.x;
	var r = this.x+this.w;
	var t = this.y;
	var b = this.y+this.h;
	var thisBox = this;

	// loop through all features
	var q = queue(1);
	var BreakException = {};

	q.defer(function (_callback)
	{
		var newIntersections = [];
		try {
			featureMap.forEach(function(geoid, feature) 
			{	
				// test the feature against the box
				var f = pathGenerator.bounds(feature);

				// see if the feature falls within the box
				var xIn = (f[0][0] > l && f[0][0] < r) || (f[1][0] > l && f[1][0] < r) || (f[0][0] <= l && f[1][0] >= r);
				var yIn = (f[0][1] > t && f[0][1] < b) || (f[1][1] > t && f[1][1] < b) || (f[0][1] <= t && f[1][1] >= b);
				if (xIn && yIn) 
				{
					newIntersections.push({geoid: geoid, feature: feature});
					if (MAX_GRID_SIZE > 0 && newIntersections.length == MAX_GRID_SIZE) 
					{
						throw BreakException;
					}
				}
			});
		} catch(e) {}

		_callback(null, newIntersections);
	});

	q.awaitAll(function(error, results) 
	{
		// we expect one result set only
		var intersections = results[0];

		// update bgRect
		thisBox.bgRect.attr("width", "100").attr("height", intersections.length*(CELL_H+PADDING_V));
		thisBox.lensGrid.clear();

		// loop through all intersections and add them to the lensGrid
		var cQ = queue(10);		
		for (var i=0, len=intersections.length; i<len; i++) 
		{
			cQ.defer(function(feature, countyNum, theCallback)
			{
				thisBox.lensGrid.addCounty(feature.properties.countyNum, feature.properties.state, feature, function() 
				{
					theCallback(null, null);
				});
			}, intersections[i].feature, i);
		}

		cQ.awaitAll(function(error, results)
		{
			// no error will happen here
			if (_masterCallback)
				_masterCallback(_masterParameter);
		});
	});
}

SelectionBox.prototype.getLensSVG = function() 
{
	return this.lensGrid.getToplevelGroup().html();
}

SelectionBox.prototype.getLensBounds = function()
{
	return this.lensGrid.getBounds();
}

SelectionBox.prototype.hideLens = function()
{
	this.lensGroup.attr("visibility", "hidden");
}

SelectionBox.prototype.isLensVisible = function()
{
	var visible = this.lensGroup.attr("visibility");
	if (visible == "visible")
		return true;
	else
		return false;
}

SelectionBox.prototype.showLens = function()
{
	this.lensGroup.attr("visibility", "visible");
}

SelectionBox.prototype.toggleLensVisibility = function()
{
	if (this.isLensVisible())
		this.hideLens();
	else
		this.showLens();
}

SelectionBox.prototype.moveLens = function(offsetX, offsetY)
{
	this.lensOffset = [offsetX, offsetY];	
	this.lensGroup.attr("transform", "translate(" + this.lensOffset[0]  + "," + this.lensOffset[1] + ")");
	this.lensGrid.updateOffset(this.lensOffset[0], this.lensOffset[1]);	
}

SelectionBox.prototype.brush = function(theColor)
{
	this.rect
		.style("fill", theColor !== undefined ? theColor : SELECTION_BOX_COLOR_BRUSH)
		.style("stroke-width", "2px");
}

SelectionBox.prototype.unbrush = function()
{
	this.rect
		.style("fill", SELECTION_BOX_COLOR)
		.style("stroke-width", "1px");
}

/* 	==================================
 *  selection boxes
 *  ==================================
 */

function SelectionBoxes(svg, brushGroup)
{
	this.boxes = [];
	this.boxesMap = d3.map();
	this.svg = svg;
	this.brushGroup = brushGroup ? brushGroup : svg.append("group")
		.attr("id", "selection_lenses");

	// create a new similarity matrix element
	this.similarityMatrix = new SimilarityMatrix(svg, this);

	
	(function(thisObject) {
		d3.select("body").on("keydown", function()
		{
			if (d3.event.keyCode == 189) 
			{
				if (SIMMAT_ELEMENT_SIZE > 1) {
					SIMMAT_ELEMENT_SIZE--;
					DENDOGRAM_NODE_HEIGHT -= 0.5;
					thisObject.similarityMatrix.drawMatrix();
				}
			}
			else if (d3.event.keyCode == 187) 
			{
				SIMMAT_ELEMENT_SIZE += 1;
				DENDOGRAM_NODE_HEIGHT += 0.5;

				thisObject.similarityMatrix.drawMatrix();
			}
		});
	})(this);

}

SelectionBoxes.prototype.getSelection = function()
{
	return this.curSelectionBox;
}

SelectionBoxes.prototype.mousedown = function(mouse)
{
	var hasSelection = false;

	// test all existing selection boxes, if any
	for (var i=0, len=this.boxes.length; i < len; i++)
	{
		if (this.boxes[i].mousedown(mouse))
		{
			this.curSelectionBox = this.boxes[i];
			hasSelection = true;
			break;
		}
	}
	
	if (!hasSelection)
	{
		this.curSelectionBox = new SelectionBox(mouse, this.brushGroup);
	}
}

SelectionBoxes.prototype.mouseup = function(mouse)
{
	var simBoxes = this;
	if (this.curSelectionBox)
	{
		var sBox = this.curSelectionBox;
		if (sBox.new) 
		{
			// make sure that we have a box of at least a set size, before adding it
			if (sBox.w < TOLERANCE * 2 || sBox.h < TOLERANCE * 2)
			{
				// too small, do nothing
				this.curSelectionBox = undefined;
				return;
			}
			else
			{
				sBox.moveLens(sBox.x + sBox.w, sBox.y + sBox.h);
				sBox.new = false;
				this.boxes.push( sBox );
			}
			sBox.hideLens();
		}

		// update the box, if it has moved
		if (sBox.updated)
		{
			// re-figure the intersections
			sBox.updated = false;
			sBox.updateIntersections( function() 
			{

				// render to the canvas
				var svgCode = "<svg>" + sBox.getLensSVG() + "</svg>";
				var canvas = document.getElementById('theCanvas');
				canvg( canvas, svgCode, { ignoreMouse: true, ignoreAnimation: true});

				// get image data and store it in the selection box
				var bounds = sBox.getLensBounds();
				sBox.img = canvas.getContext("2d").getImageData(0, 0, bounds[0]-1, bounds[1]-1);

				// update similarity measures
				simBoxes.updateSimilarityMeasures(sBox);

			});
		}

	}
	this.curSelectionBox = undefined;
}

SelectionBoxes.prototype.id2Matrix = function(id)
{
	return this.boxesMap.get(id);
}

SelectionBoxes.prototype.brushBoxes = function(brushList, dontBrushMatrix)
{

	var i = brushList[0];
	var j = brushList.length > 1 ? brushList[1] : i;

	this.brushedBox = brushList;

	for (var k = 0; k < brushList.length; k++)
		this.boxes[ brushList[k] ].brush();
	
	if (!dontBrushMatrix)
		this.similarityMatrix.brush(this.brushedBox);
}

SelectionBoxes.prototype.unbrushBoxes = function(dontBrushMatrix)
{
	if (this.brushedBox !== undefined)
	{
		for (var k = 0; k < this.brushedBox.length; k++)
			this.boxes[ this.brushedBox[k] ].unbrush();	

		if (!dontBrushMatrix)
			this.unbrushMatrix();
		this.brushedBox = undefined;
	}
}

SelectionBoxes.prototype.brushMatrix = function(id, columnOnly)
{
	var i = this.boxesMap.get(id);
	if (i !== undefined)
		this.similarityMatrix.brush([i, i]);
}

SelectionBoxes.prototype.unbrushMatrix = function()
{
	this.similarityMatrix.unbrush();
}

SelectionBoxes.prototype.updateSimilarityMeasures = function(updatedBox)
{
	for (var i = 0; i < this.boxes.length; i++)
	{
		var a = this.boxes[i];
		if (a.id != updatedBox.id) 
		{
			// test the similarity of these two
			var w = Math.min(updatedBox.img.width, a.img.width);
			var h = Math.min(updatedBox.img.height, a.img.height);

			var imgA = a.img.data;
			var imgB = updatedBox.img.data;
			
			var index = 0;
			var similarity = 0;
			for (var j=0; j<h; j++)
			{
				for (var k=0; k<w; k++)
				{
					var pA = imgA[index] > 50 ? 1 : 0;
					var pB = imgB[index] > 50 ? 1 : 0;
					if (pA == pB) similarity++;
					index += 4;
				}
			}
			// normalize similarity
			similarity /= w*h;

			// store it
			updatedBox.lensSimilarity.set( a.id, similarity );
			a.lensSimilarity.set( updatedBox.id, similarity );
		}
	}

	// re-construct similarity matrix
	var minSimilarity = 1;
	var simMatrix = [];
	var boxI = -1;

	for (var i = 0, count = this.boxes.length; i < count; i++)
	{
		if (this.boxes[i].id == updatedBox.id) {
			boxI = i;
		}
		simMatrix.push([]);
		for (var j = 0; j < count; j++)
		{
			var otraID = this.boxes[j].id;
			simMatrix[i][j] = ( i == j ? 1 : this.boxes[i].lensSimilarity.get(otraID));
			minSimilarity = Math.min(minSimilarity, simMatrix[i][j]);
		}
	}
	this.similarityMatrix.updateMatrix(simMatrix, minSimilarity);
	this.boxesMap.set(updatedBox.id, boxI);
}

SelectionBoxes.prototype.mousemove = function(mouse)
{
	this.curSelectionBox.mousemove(mouse);
}
