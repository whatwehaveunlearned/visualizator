//load db from list of db and added to databasesObjects
function loadDb(name,id){
	if(name.split(".")[1]=="csv"){
		d3.csv("datasets/" + name,function(data){
			var attrTypes = [];
			//ADD UNIQUE KEY FOR EACH DB ELEMENT
			myId(data);
			for (each in Object.keys(data[0])){
				attrTypes.push({attr:Object.keys(data[0])[each],type:"Number (Hole)"})
			};
			if (data instanceof Array){
				db =  {
				  id: id,
	              name: name,
	             metadata : {
	             				 included :false,
	             				 infered: {
	             				 			attrTypes:attrTypes
	             				 		  },
	             			},
	              data:data
	            };
			}else{
				db =  {
				  id: id,
	              name: name,
	              metadata : { 
	              				included :data.meta,
	              				infered: {
	             				 			attrTypes:attrTypes
	             				 		 },
	              			 },
	              data:data.data
	            };
			}
	        databasesObjects.push(db);
	        dbKwCard(db);
			dbNormalize(db); 
		});
	}else if(name.split(".")[1]=="json"){
		d3.json("datasets/" + name,function(data){
			//ADD UNIQUE KEY FOR EACH DB ELEMENT
			myId(data);
			var attrTypes = []
			for (each in Object.keys(data[0])){
				attrTypes.push({attr:Object.keys(data[0])[each],type:"Number (Hole)"})
			};
			if (data instanceof Array){
				db =  {
				  id: id,
	              name: name,
	             metadata : { included :false,
	             			  infered: {
	             				 			attrTypes:attrTypes
	             				 		},
	             			},
	              data:data
	            };
			}else{
				db =  {
				  id: id,
	              name: name,
	              metadata : { included :data.meta, infered:attrTypes},
	              data:data.data
	            };
			}
	        databasesObjects.push(db);
	        dbKwCard(db);
			dbNormalize(db);  
		});
	}
	dbCounter=dbCounter+1;

	//loadDb Internal Functions
	//Add myId attr to db
	function myId(data){
		var counter = 0;
		for(each in data){
			data[each]['myId']=counter;
			counter++; 
		}
	}
}

//Constructs dbKWCard  (databaseKnowledgeCard)
function dbKwCard(db){
	var attrs = Object.keys(db.data[0]);
	//Change myId to be the first element
	var temp = attrs[0];
	attrs[0]=attrs[(attrs.length-1)];
	attrs[(attrs.length-1)]=temp;
	var card = d3.select( "body" )
	  			 .append("div")
	  			 .attr({
	  				"id":"dbKwCard"+dbCounter,
	  				"class":"dbKwCard"
	  			 })
	  			 .style("width","1000px");
	var cardTitle = card.append("div")
						.attr("id","dbKwCardTitle"+dbCounter)
	cardTitle.append("p")
	  		.text(db.name);
	cardTitle.append("span")
			 .attr("class","glyphicon glyphicon-remove")
			 .on("click",function()
    		{
    			$("#dbKwCard"+dbCounter).remove();
    		});
	fillAttrTable(db,attrs);
	fillTypeTable(attrs);
	card.append("button")
	  	.text("ok");
	card.append("button")
	  	.text("New Graph with this data");
	$("#"+"dbKwCard"+dbCounter).draggable();
	$("#"+"dbKwCard"+dbCounter).resizable();

	//dbKwCard Internal functions
	//Fill table of data
	function fillAttrTable(db,attrs){
		var table= d3.select("#"+"dbKwCard"+dbCounter)
		  			 .append("table")
		  			 .attr({
		  				 "id":"attrTable"+dbCounter
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
		$('#attrTable'+dbCounter).dataTable({
			data:db.data,
			columns:columnsData,
			scrollY: 300,
			"scrollX": true
		});
	}
	//Fill table of attributes Types
	function fillTypeTable (attrs){
	 	var table= d3.select("#"+"dbKwCard"+dbCounter)
	  			 .append("table")
	  			 .attr({
	  				 "id":"typeTable"+dbCounter
	  			 })
	  			 .style("height","100px");
	  	var theadTr = table.append("thead")
					 .append("tr")
	  	for (each in attrs){
	  		var attr = theadTr.append("th").text(attrs[each])
	  	}
	  	var tbody = table.append("tbody")
	  				   .append("tr")
	  	for (each in attrs){
	  		var td = tbody.append("td")
	  		dataType(td,each,attrs);
	  	}
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
		var dataTypes =["Number (Hole)","Number (Decimal)","Date or Time","String"];
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
    				db.metadata.infered.attrTypes.push({attr:keyValues[selectedAttr],type:type});
	    			dbNormalize(db,this.text,keyValues[selectedAttr]);
	    		})
				.text(dataTypes[element]);
		}
	}
}
//Normalize dates and map features
function dbNormalize(db,type,keyValue){
	if(type=="Date or Time"){
		normalizeTime(keyValue)
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
	if(type=="scatterPlot"){
		for (i=0;i<data.length;i++){
			dataObjects.push(data[i]);
        	dataToRender.push([eval("data[i]."+attrs[0]),eval("data[i]."+attrs[1]),data[i].myId]);
    	}
	}else if(type=="histogram"){
		for (i=0;i<data.length;i++){
			dataObjects.push(data[i]);
        	dataToRender.push(eval("data[i]."+attrs[0]));
    	}
    }else if(type=="lineChart"){
    	var dateAttr;
    	for(i=0; i<db.metadata.infered.attrTypes.length; i++){
    		if(db.metadata.infered.attrTypes[i].type=="Date or Time"){
    			dateAttr=db.metadata.infered.attrTypes[i].attr;
    			i=db.metadata.infered.attrTypes.length;
    		}
  		}
  		//Order the elements based on date (older to newer) to paint line.
  		data.sort(function(a,b){
		  return eval("a."+dateAttr)-eval("b."+dateAttr);
		});
		for (i=0;i<data.length;i++){
			dataObjects.push(data[i]);
        	dataToRender.push([eval("data[i]."+attrs[0]),eval("data[i]."+dateAttr)]);
    	}
    }
}