//load db from list of db and added to databasesObjects
function loadDb(name,id,menuPos){
	var db =  {
				  id: "id",
	              name: "name",
	              metadata : {
	             				 included :"hasMetadata?",
	             				 //Added Metadata
	             				 infered: {
	             				 			attrTypes:"attrTypes",
	             				 			mapData: {
	             				 				map:"mapData",
	             				 				cities:{
	             				 					locations: "citiesLocation",
	             				 					names: "citiesName"
	             				 				},
	             				 			},
	             				 		  },
	             			},
	              data:"dataValues"
	};

	var attrTypes = [];
	var mapData = [];
	var citiesLocation = [];
	var citiesName = [];
	if(name.split(".")[1]=="csv"){
		d3.csv("datasets/" + name,function(data){
			//ADD UNIQUE KEY FOR EACH DB ELEMENT
			myId(data);
			//Add Dimension types
			for (each in Object.keys(data[0])){
				attrTypes.push({attr:Object.keys(data[0])[each],type:"Integer"})
			};
			//Add map Info
			createMap(mapData,citiesLocation,citiesName,db);
			if (data instanceof Array){
				db.id = id;
				db.name = name;
				db.metadata.included = false;
	            db.metadata.infered.attrTypes=attrTypes; 
	            db.data=data
			}else{
				db.id = id;
				db.name = name;
				db.metadata.included = data.meta;
	            db.metadata.infered.attrTypes=attrTypes;
	            db.data=data
			}
	        databasesObjects.push(db);
	        //dbDimensionOrMeasure(db);
	        dbKwCard(db,menuPos);
			//dbNormalize(db);
			dbCounter=dbCounter+1; 
		});
	}else if(name.split(".")[1]=="json"){
		d3.json("datasets/" + name,function(data){
			//ADD UNIQUE KEY FOR EACH DB ELEMENT
			myId(data);
			for (each in Object.keys(data[0])){
				attrTypes.push({attr:Object.keys(data[0])[each],type:"Integer"})
			};
			//Add map Info
			createMap(mapData,citiesLocation,citiesName);
			if (data instanceof Array){
				db.id= id;
				db.name=name;
				db.metadata.included=false;
	            db.metadata.infered.attrTypes;
	            db.data=data
			}else{
				db.id = id;
				db.name = name;
				db.metadata.included = data.meta;
	            db.metadata.infered.attrTypes=attrTypes;
	            db.data=data
			}
	        databasesObjects.push(db);
	        //NEED SOME PREPROCESSING TO ADD DIMENSIONORMEASURE AND NORMALIZE AT THIS POINT
	        //dbDimensionOrMeasure(db);
	        dbKwCard(db,menuPos);
			//dbNormalize(db);
			dbCounter=dbCounter+1;  
		});
	}

	//loadDb Internal Functions
	//Add myId attr to db
	function myId(data){
		var counter = 0;
		for(each in data){
			data[each]['myId']=counter;
			counter++; 
		}
	}

	function createMap(mapData,citiesLocation,citiesName,db){
		 d3.json("datasets/hawaii.json", function(error, hawaii) {
		 	if (error) return console.error(error);
		 	mapData = topojson.feature(hawaii, hawaii.objects.filterMap).features
		 	citiesLocation = topojson.feature(hawaii, hawaii.objects.hawaiiPlaces);
		 	citiesName = topojson.feature(hawaii, hawaii.objects.hawaiiPlaces).features;
		 	db.metadata.infered.mapData.map = mapData,
	        db.metadata.infered.mapData.cities.locations = citiesLocation,
	        db.metadata.infered.mapData.cities.names = citiesName
		});
	}
	function dbDimensionOrMeasure(db){
		for (var element in db.data){
			if (db.data.hasOwnProperty(element)) {
		       var obj = db.data[element];
		        for (var prop in obj) {
		          // important check that this is objects own property 
		          // not from prototype prop inherited
		          if(obj.hasOwnProperty(prop)){
		          	//Dimension
		            if(isNaN(eval("obj."+prop))){
		            	db.data[element][prop] = String(eval("obj."+prop))
		            }else{//Measure
		            	db.data[element][prop] = +eval("obj."+prop)
		            }
		          }
		        }
			}
		}
	}
}

//Constructs dbKWCard  (databaseKnowledgeCard)
function dbKwCard(db,menuPos){
	var attrSelection=[];
	var graphTypeSelection="Histogram";
	var attrs = Object.keys(db.data[0]);
	//Change myId to be the first element (switch last for first)
	var temp = attrs[0];
	attrs[0]=attrs[(attrs.length-1)];
	attrs[(attrs.length-1)]=temp;
	var card = d3.select( "#applicationArea" )
	  			 .append("div")
	  			 .attr({
	  				"id":"dbKwCard-"+dbCounter,
	  				"class":"dbKwCard"
	  			 })
	  			 .style("width","1300px")
	  			 .style("left", menuPos[0] + "px")     
          		 .style("top", menuPos[1]  + "px");
	var cardTitle = card.append("div")
						.attr("id","dbKwCardTitle"+dbCounter)
						.attr("class","dbKwCardTitle")
	cardTitle.append("p")
	  		.text(db.name);
	cardTitle.append("span")
			 .attr("class","glyphicon glyphicon-remove removeCard")
			 .on("click",function()
    		{
    			$("#dbKwCard-"+this.parentElement.parentElement.id.split("-")[1]).remove();
    		});
	fillAttrTable(db,attrs);
	fillTypeTable(attrs);
	card.append("button")
		.attr("id","newGraph")
		.on("click",function()
	    	{
	    		$("#newGraph").hide();
	    		var graphTypes = ["Histogram","Scatterplot","Linechart","Map"]
	    		var dataBase = this.parentElement.id.split("-")[1];
	    		var cardMenu = card.append("div")
	    							.attr({
	    								"id":"dbKwCardMenu-"+dbCounter,
	    								"class":"dbKwCardMenu"
	    							});
	    		var minimize = cardMenu.append("span")
			 							.attr("class","glyphicon glyphicon-chevron-up")
			 							.style("float","right")
			 							.on("click",function()
    									{
    										$("#dbKwCardMenu-"+this.parentElement.id.split("-")[1]).remove();
    										$("#newGraph").show();
    									});
	    		//Attr List Selection
	    		var list =	cardMenu.append("ol")
	    							.attr({
	    								"id":"attrList-"+dbCounter,
	    								"class":"selectable"
	    							})
	    		for (value in Object.keys(databasesObjects[dataBase].data[0])){	
	    			list.append("li")
	    				.attr({
	    					"class":"ui-widget-content"
	    				})
	    				.text(Object.keys(databasesObjects[dataBase].data[0])[value]);
	    		}
	    		$(".selectable").selectable({
	    			stop: function() {
	    				attrSelection=[];
				        $( ".ui-selected").each(function() {
				          var index = $( "#selectable li" ).index( this );
				          attrSelection.push(this.textContent);
				        });
				    }
	    		})
	    		//graphType Selection
	    		var cardGraphType = cardMenu.append("div")
	    							.attr({
	    								"id":"dbKwCardgraphType-"+dbCounter,
	    								"class":"dbKwCardMenugraphType"
	    							})
    			var fieldset = cardGraphType.append("form")
    						 			.attr("action","#")
    						 			.append("fieldset")
    						 			
	 			fieldset.append("label")
	 					.attr("for","graphType"+dbCounter)
	 					.text("Select Type")
	 			var dropdown = fieldset.append("select")
	 								   .attr({
	 								   "name":"graphType",
	 								   "id":"graphType-"+dbCounter
	 									})
    			for (type in graphTypes){
    				dropdown.append("option")
    						.text(graphTypes[type])
	    		}
	    		//Create New Graph
	    		cardMenu.append("button")
	    				.attr("id","create")
	    				.on("click",function()
	    				{	
	    					//var mousePos = d3.mouse(d3.select("#"+this.parentElement.id).node());
	    					var mousePos = d3.mouse(d3.select("#applicationArea").node());
	    					var dataToRender = [];
	    					var dataObjects;
	    					if (attrSelection.length==1){
							    xAxisName = "";
							    yAxisName = attrSelection[0];
							    title = db.name + " " + attrSelection[0];
							  } 
							else if (attrSelection.length==2){
							    xAxisName = attrSelection[0];
							    yAxisName = attrSelection[1];
							    title = db.name + " " + attrSelection[0] + "/" +attrSelection[1];
							}
							//Gets the elements filtered from the table
							dataObjects = dataTableAttr._('tr', {"filter":"applied"}); 
	    					selectData(db,db.data,attrSelection,graphTypeSelection,dataToRender,dataObjects);
      						areaCreator (title,db,xAxisName,yAxisName,dataToRender,dataObjects,graphTypeSelection,mousePos);
	    				})
	    				.text("create")
	    		$("#graphType-"+dbCounter).selectmenu({
	    			change: function( event, data ) {
				          graphTypeSelection= data.item.value;
				    }
	    		});
	    	})
	  	.text("New Graph");
	$("#"+"dbKwCard-"+dbCounter).draggable();
	$("#"+"dbKwCard-"+dbCounter).resizable();

	//dbKwCard Internal functions
	//Fill table of data
	function fillAttrTable(db,attrs){
		var table= d3.select("#"+"dbKwCard-"+dbCounter)
		  			 .append("table")
		  			 .attr({
		  				 "id":"attrTable"+dbCounter,
		  				 "class":"attrTable compact order-column row-border"
		  			 })
		var theadTr = table.append("thead")
						 .append("tr");
		//add Headers
		for (each in attrs){
			var attr = theadTr.append("th").text(attrs[each])
		}
		var columnsData = [];
			for (each in attrs){
				columnsData.push({data : attrs[each]})
			}
		//Convert to dataTable
		dataTableAttr=$('#attrTable'+dbCounter).dataTable({
			data:db.data,
			columns:columnsData,
			scrollY: 300,
			"scrollX": true,
			"lengthMenu": [ 25, 50, 75, 100 ]
		});
	}
	//Fill table of attributes Types
	function fillTypeTable (attrs){
	 	var table= d3.select("#"+"dbKwCard-"+dbCounter)
	  			 .append("table")
	  			 .attr({
	  				 "id":"typeTable"+dbCounter,
	  				 "class":"typeTable typeTable compact dt-head-left dt-body-center"
	  			 })
	  			 .style("height","100px");
	  	var theadTr = table.append("thead")
					 .append("tr")
	  	for (each in attrs){
	  		var attr = theadTr.append("th").text(attrs[each])
	  	}
	  	var tbody1 = table.append("tbody")
	  				   .append("tr")
	  	for (each in attrs){
	  		var td = tbody1.append("td")
	  		dataType(td,each,attrs);
	  	}
	  	var tbody2= table.append("tbody")
	  					 .append("tr")
	  	/*for (each in attrs){
	  		var td = tbody2.append("td")
	  		dataType(td,each,attrs);
	  	}*/
	  	$('#typeTable'+dbCounter).dataTable({
	  		paging: false,
	  		searching: false,
	    	ordering:  false,
	    	"scrollX": true,
	    	scrollY: false,
	    	info:  false
	  	});
	}
	//Create dropdown menu for attributes Types
	function dataType(element,each,attrs){
		var dataTypes =["Integer","Decimal","Date/Time","String","Coord"];
		//Read types from db in order to fill table
		var actualType = [];
		for (attr in attrs){
			for (object in db.metadata.infered.attrTypes){
				if(attrs[attr]==db.metadata.infered.attrTypes[object].attr){
					actualType.push(db.metadata.infered.attrTypes[object].type)
				}
			}
		}
		var dropdown = element.append("div")
							  .attr("class","dropdown")
		dropdown.append("button")
				.attr({
						"class":"btn btn-default dropdown-toggle",
						"type":"button", 
						"id":"dropdownMenu"+each, 
						"data-toggle":"dropdown", 
						"aria-expanded":"true"
					})
					.on("click",function()
	    			{
	    			d3.select("typeTable")
	    			  .style("height","100px");
	    			})
					.text(actualType[each])
					.append("span")
					.attr("class","caret")
		
		var list = dropdown.append("ul")
			   .attr({
			   		"class":"dropdown-menu",
			   		"id":"attr-"+each,
			   		"role":"menu",
			   		"aria-labelledby":"dropdownMenu"
			   })
		for (element in dataTypes){
			list.append("li")
				.attr({
				    "role":"presentation",
				})
				.append("a")
				.attr({
					"class":"attrType-"+each,
				   	"role":"menuitem",
				   	"tabindex":"-1",
				   	"href":"#"
				})
				.on("click",function()
	    		{	
	    			var keyValues = [];
	    			var selectedAttr=this.parentElement.parentElement.id.split("-")[1]
	    			var type = this.text;
	    			var typeObject = {attr:selectedAttr,type:type}
	    			//Set te selected type
	    			d3.select("#"+this.parentElement.parentElement.parentElement.children[0].id)
	    			  .text(this.text)
	    			  .append("span")
	    			  .attr("class","caret")
	    			//We need to recover the keys values
	    			for (var i=0;i<this.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.children[0].children[0].children.length;i++){
	    				keyValues.push(this.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.children[0].children[0].children[i].children[0].textContent);
	    			}
	    			//check if we already added the attr and update value if not create value
    				for (var i = 0; i<db.metadata.infered.attrTypes.length; i++){
    					if (db.metadata.infered.attrTypes[i].attr==keyValues[selectedAttr]){ 
    							db.metadata.infered.attrTypes[i]={attr:keyValues[selectedAttr],type:type};
    							i=db.metadata.infered.attrTypes.length;
    					}
    				}
    				//I think this line should be eliminated db.metadata.infered.attrTypes.push({attr:keyValues[selectedAttr],type:type});
	    			dbNormalize(db,this.text,keyValues[selectedAttr]);
	    		})
				.text(dataTypes[element]);
		}
	}
}
//Normalize dates and map features
function dbNormalize(db,type,keyValue){
	if(type=="Date/Time"){
		normalizeTime(keyValue)
	}else if(type=="Coord"){
		normalizeCoordinate(keyValue)
	}else if(type=="Decimal"){
		for(each in db.data){
			//Check if it has a comma
			if(db.data[each][keyValue].indexOf(',') > -1){
				//If thousands comma
				if(db.data[each][keyValue].split(",")[1].split(".")[0].length==3){
					db.data[each][keyValue]=db.data[each][keyValue].replace(",", "")
				}//If not it has to be decimal coma
				else{
					db.data[each][keyValue]=db.data[each][keyValue].replace(",", ".")
				}
			}
			db.data[each][keyValue] = parseFloat(db.data[each][keyValue]);
		}
	}else if(type=="Integer"){
		for(each in db.data){
			db.data[each][keyValue] = parseInt(db.data[each][keyValue]);
		}
	}
	//Internal dbNormalize Functions
	//Function to normalizeTime
	function normalizeTime(keyValue){
		var dbElement;
		var temp;
		for(each in db.data){
			db.data[each][keyValue] = new Date(String(eval("db.data[each]."+ keyValue)));
		}
	}

	//Right now is made as a hack depending on the db we need to see how to do this
	function normalizeCoordinate(keyvalue){
		for(each in db.data){
			if(db.data[each][keyValue]!="") {db.data[each][keyValue] = db.data[each][keyValue].split("(")[1].split(")")[0];}
		}
	}
	
	//*******************************Geolocation using google API Not valid now*********************************
	function normalizeGoogleCoordinate(){
		var address = [];
		var resultsArray = [];
		//To monitor elements and send them in groups of 5 google API does not allow more at a time
		var counter = 0;
		loopElements();

		function loopElements(){
			for (i=counter;i<counter+5;i++){
				dbGeocoder(db.data[i].BlockAddress+" Hawaii");
			}
		}

		function dbGeocoder(address){
			var geocoder = new google.maps.Geocoder();
			geocoder.geocode( { 'address': address}, function(results, status) {
		      if (status == google.maps.GeocoderStatus.OK) {
		        resultsArray.push(results);
		        if(resultsArray.length==counter+5){
		        	counter=counter+5;
		        	console.log(counter);
		        	loopElements();
		        }else if (resultsArray.length==db.data.length){
		        	parseDb(resultsArray);
		        }
		      } else {
		        resultsArray.push("Geocode was not successful for the following reason: " + status);
		        if(resultsArray.length==counter+5){
		        	counter=counter+5;
		        	console.log(counter);
		        	loopElements();
		        }else if (resultsArray.length==db.data.length){
		        	parseDb(resultsArray);
		        }
		      }
		    });
		}

		function parseDb(resultsArray){
			for (result in resultsArray){
				if (typeof resultsArray[result] != "String")
				{
					if (resultsArray[result].length>1){
						for (element in resultsArray[result]){
							if(resultsArray[result][element].address_components!=undefined && resultsArray[result][element].address_components[3].long_name=="Hawaii"){
								db.data[result].BlockAddress=resultsArray[result][element];
							}
						}
					}else{
						db.data[result].BlockAddress=resultsArray[result][0];
					}
				}
			}
		}
		//*******************************END Geolocation using google API Not valid now *********************************
	}

	/*	function normalizeCoordinate(){
		MQA.withModule("geocoder", function() {
			var locations = ["4400 BLOCK KAPOLEI PKWY"];
		    // executes a geocode and adds the result to the map
		    MQA.Geocoder.geocode(locations, { maxResults: 10 }, null, function (response) {
		    	console.log(response);
		    });
		});
	}*/
}
//Select a database from databasesObjects
//returns databaseObject. Needs name of db.
function selectDb(name){
	for (element in databasesObjects){
		if(name==databasesObjects[element].name){
			return databasesObjects[element];
		}
	}
}
//Selects data to plot on the area depending on the type of graph
function selectData(db,data,attrs,type,dataToRender,dataObjects){
	if(type=="Scatterplot"){
		for (i=0;i<dataObjects.length;i++){
        	dataToRender.push([eval("dataObjects[i]."+attrs[0]),eval("dataObjects[i]."+attrs[1]),data[i].myId]);
    	}
	}else if(type=="Histogram"){
		for (i=0;i<dataObjects.length;i++){
        	dataToRender.push(eval("dataObjects[i]."+attrs[0]));
    	}
    }else if(type=="Linechart"){
    	var dateAttr;
    	for(i=0; i<db.metadata.infered.attrTypes.length; i++){
    		if(db.metadata.infered.attrTypes[i].type=="Date/Time"){
    			dateAttr=db.metadata.infered.attrTypes[i].attr;
    			i=db.metadata.infered.attrTypes.length;
    		}
  		}
  		//Order the elements based on date (older to newer) to paint line.
  		dataObjects.sort(function(a,b){
		  return eval("a."+dateAttr)-eval("b."+dateAttr);
		});
		for (i=0;i<dataObjects.length;i++){
        	dataToRender.push([eval("dataObjects[i]."+attrs[0]),eval("dataObjects[i]."+dateAttr)]);
    	}
    }else if(type=="Map"){
    	for (i=0;i<dataObjects.length;i++){
        	if(isNaN(parseFloat(eval("dataObjects[i]."+attrs[0]).split(",")[0]))!=true)
        	{
        		dataToRender.push([parseFloat(eval("dataObjects[i]."+attrs[0]).split(",")[0]),parseFloat(eval("dataObjects[i]."+attrs[0]).split(",")[1]),dataObjects[i].myId]);
        	}
    	}
    }
}