//load db
function loadDb(name,id){
	if(name.split(".")[1]=="csv"){
		d3.csv("datasets/" + name,function(data){
			var attrTypes = []
			//ADD UNIQUE KEY FOR EACH DB ELEMENT
			myId(data);
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
		});
	}else if(name.split(".")[1]=="json"){
		d3.json("datasets/" + name,function(data){
			var attrTypes = []
			//ADD UNIQUE KEY FOR EACH DB ELEMENT
			myId(data);
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
		});
	}
	dbCounter=dbCounter+1;

	function myId(data){
		var counter = 0;
		for(each in data){
			data[each]['myId']=counter;
			counter++; 
		}
	}
}


function dbKwCard(db){
	var attrs = Object.keys(db.data[0]);
	//Change myId to be the first element
	var temp = attrs[0];
	attrs[0]=attrs[(attrs.length-1)];
	attrs[(attrs.length-1)]=temp;
	var card = d3.select( "body" )
	  			 .append("div")
	  			 .attr({
	  				"id":"dbKwCard"+graphCounter,
	  				"class":"dbKwCard"
	  			 })
	  			 .style("width","1000px");
	var cardTitle = card.append("div")
						.attr("id","dbKwCardTitle"+graphCounter)
	cardTitle.append("p")
	  		.text(db.name);
	cardTitle.append("span")
			 .attr("class","glyphicon glyphicon-remove")
			 .on("click",function()
    		{
    			console.log("Remove Area");
    		});
	fillAttrTable(db,attrs);
	fillTypeTable(attrs);
	card.append("button")
	  	.text("ok");
	card.append("button")
	  	.text("New Graph with this data");
	$("#"+"dbKwCard"+graphCounter).draggable();
	$("#"+"dbKwCard"+graphCounter).resizable();
}

function fillAttrTable(db,attrs){
	var table= d3.select("#"+"dbKwCard"+graphCounter)
	  			 .append("table")
	  			 .attr({
	  				 "id":"attrTable"
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
	$('#attrTable').dataTable({
		data:db.data,
		columns:columnsData,
		scrollY: 300,
		"scrollX": true
	});
}

function fillTypeTable (attrs){
 	var table= d3.select("#"+"dbKwCard"+graphCounter)
  			 .append("table")
  			 .attr({
  				 "id":"typeTable"
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
  	$('#typeTable').dataTable({
  		paging: false,
  		searching: false,
    	ordering:  false,
    	"scrollX": true,
    	scrollY: false,
    	info:  false
  	});
}

function dataType(element,each){
	var dataTypes =["Number (Decimal)","Number (Hole)","Date or Time","String"];
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
				.text(dataTypes[0])
				.append("span")
				.attr("class","caret")
	
	var list = dropdown.append("ul")
		   .attr({
		   		"class":"dropdown-menu",
		   		"id":"attr-"+each,
		   		"role":"menu",
		   		"aria-labelledby":"dropdownMenu"
		   })
	for (each in dataTypes){
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
    			if (db.metadata.infered.attrTypes.length>0){
    				for (var i = 0; i<db.metadata.infered.attrTypes.length; i++){
    					if (db.metadata.infered.attrTypes[i].attr==keyValues[selectedAttr]){ 
    							db.metadata.infered.attrTypes[i]={attr:keyValues[selectedAttr],type:type};
    							i=db.metadata.infered.attrTypes.length;
    					}
    				}
    				db.metadata.infered.attrTypes.push({attr:keyValues[selectedAttr],type:type});
    			}else { 
    				db.metadata.infered.attrTypes.push({attr:keyValues[selectedAttr],type:type});
    			}
    		})
			.text(dataTypes[each]);
	}
}

function selectDb(name){
	for (element in databasesObjects){
		if(name==databasesObjects[element].name){
			return databasesObjects[element];
		}
	}
}

function selectData(db,attrs,type,dataToRender,dataObjects){
	if(type=="scatterPlot"){
		for (i=0;i<db.length;i++){
			dataObjects.push(db[i]);
        	dataToRender.push([eval("db[i]."+attrs[0]),eval("db[i]."+attrs[1]),db[i].myId]);
    	}
	}else if(type=="histogram"){
		for (i=0;i<db.length;i++){
			dataObjects.push(db[i]);
        	dataToRender.push(eval("db[i]."+attrs[0]));
    	}
    }
}