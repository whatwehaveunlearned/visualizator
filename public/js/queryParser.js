//File to Parse Queries done to the different Web Services
function searchSocrata(){
		if(document.getElementById("value").value!="") var query = "http://api.us.socrata.com/api/catalog/v1?categories" + "=" + encodeURIComponent(document.getElementById("value").value.trim());
		else var query ="http://api.us.socrata.com/api/catalog/v1?categories" + encodeURIComponent(document.getElementById("value").value.trim());
		d3.json(query, function(error, data) {
			element = d3.select("#value");
			console.log(data);
		});
	}

function searchDataGov(menuPos,type){
	//var query = "http://catalog.data.gov/api/3/action/package_search?fq=tags:economy";
	switch(type){
		case "Topics":
			var query = "http://catalog.data.gov/api/3/action/group_list";
			break;
		case "Tags":
			var query = "http://catalog.data.gov/api/3/action/tag_list";
			break;
		default:
			var query = "http://catalog.data.gov/api/3/action/package_search?fq=tags:" + encodeURIComponent(document.getElementById("value").value.trim());
	}
	d3.json(query, function(error, data) {
		element = d3.select("#value");
		resourceBrowser(name,"DataGov",menuPos,data);
	});
}

function resourceBrowser(name,id,menuPos,data){
	if(id=="DataGov"){
		var simplifiedData=[];
      	for (var each in data.result.results){
      		var resources = [];
      		for (var i=0;i<data.result.results[each].num_resources;i++){
				//if (data.result.results[each].resources[i].mimetype == "text/csv"){
					resources.push(data.result.results[each].resources[i].name + "(" + data.result.results[each].resources[i].mimetype + ")");
				//}else if(data.result.results[each].resources[i].mimetype == "text/json") resources.push(data.result.results[each].resources[i]);
			}
			simplifiedData.push({name: data.result.results[each].name, maintainer_email:data.result.results[each].maintainer_email, id: data.result.results[each].id, created: data.result.results[each].metadata_created, modified: data.result.results[each].metadata_modified, numberResources:data.result.results[each].num_resources, resourcesNames: resources.toString(), resources: data.result.results[each].resources});
        }
		db =  {
			  id: id,
              name: name,
              metadata : {
	            included : data.result.results,
	            infered: {
	             	//attrTypes:attrTypes
	            },
	          },
              data: simplifiedData
	    };
	    //dbDimensionOrMeasure(db);
	    var temp = Object.keys(simplifiedData[0]);
	    temp.splice(temp.length-1,1);
	    table(db.id,temp,simplifiedData,menuPos,false);
	}
}

function table(id,columns,data,menuPos,isResources){
		function tableResources(d,i){
			var columnsResources = Object.keys(d.resources[0]);
			table(d.id,columnsResources,d.resources,menuPos,true);
		}
		function openResource(d){
			var url = d.url;
			loadURLDb(d.name,d.id,menuPos,"json",url)
		}
    	function handleMouseOut(d,i){
			d3.select("#link"+this.id)
    		  	.style("stroke", linkColor);
		}
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
							.attr("id","openDataDiv"+dbCounter)
							.attr("class","dbKwCardTitle")
		cardTitle.append("p")
		  		.text("Peter");
		cardTitle.append("span")
				 .attr("class","glyphicon glyphicon-remove removeCard")
				 .on("click",function()
	    		{
	    			$("#openDataDiv").remove();
	    		});
		cardTitle.append("div")
			.attr("id","openDataDiv");
		var dataTable = d3.select("#openDataDiv").append("table")
			.attr("id","openDataTable"+id)
			thead = dataTable.append("thead"),
		    tbody = dataTable.append("tbody");

		thead.append("tr")
			 .selectAll("th")
			 .data(columns).enter()
			 .append("th")
			 .text(function(d) {
			 	return d;
			 });

		var rows = tbody.selectAll("tr")
	        .data(data)
	        .enter()
	        .append("tr")
	        .attr("id", function(d,i){return i })
	        .style("background-color", function(d,i){
	        	return ((i % 2 == 0) ? "rgba(63, 191, 127, 0.4)" : "rgba(63, 191, 127, 0.2)");})
	       	if(isResources==true) rows.on("click",openResource);
	       	else rows.on("click",tableResources);
	       	//.on("mouseout",handleMouseOut);

	    var cells = rows.selectAll("td")
	        .data(columns)
	        .enter()
	        .append("td")
	        .attr("class", function(d,i){return "col" + i +  " " + d})
	        .attr("id",function(d,i){
	        	return this.parentElement.id + "-" +i;})
	    var selector = d3.selectAll(".col0")
	    	.append("input")
	    	.attr({
	    		"type":"checkbox",
	    		"name": function(d,i) { return (i)},
	    		"value": function(d,i) { return (i)},
	    		"checked":"checked"
	    	})
	   	fillTable(data,columns,id);
}

function fillTable(data,columns,id){
	    	function handleclick(d,i){
	    		div = d3.select("#tableTooltip");
    			div.transition()
       				.duration(200)
       				.style("opacity", .9);
       			if(this.classList[0]=="iData"){
       				div.html("<p>"+ d[0].toFixed(2) +" GB</p> <p>"+ (100*d[0]/totalDataIn).toFixed(2) + " %" )
			       .style("left", (d3.event.pageX + 5) + "px")
			       .style("top", (d3.event.pageY - 28) + "px");
			   }else{
			   		div.html("<p>"+ d[1].toFixed(2) +" GB</p> <p>"+ (100*d[1]/totalDataOut).toFixed(2) + " %" )
			       .style("left", (d3.event.pageX + 5) + "px")
			       .style("top", (d3.event.pageY - 28) + "px");
			   }
	    	}
	    	function handleMouseOut(d,i){
    		    div = d3.select("#tableTooltip");
			    div.transition()
			       .duration(500)
			       .style("opacity", 0);
	    	}
	    	var margin = {top: 2, right: 15, bottom: 16, left: 15, nameLeft:30, histogramLeft: 0},
	        width = 350 - margin.left - margin.right,
	        height = 100 - margin.top - margin.bottom;
	    	// Define the div for the tooltip
			var div = d3.select("body").append("div")
			    .attr("id", "tableTooltip")
			    .style("opacity", 0);
	    	var barwidth = 15;
	    	var position = {position1: height/4 , position2: height - height/3}

	    	for (var element in columns){
	    		d3.selectAll("."+columns[element])
	    			.data(data)
	    			.html(function(d){
	    				if(element==columns.length-1)  return "<p>" + eval("d." + columns[element]) + " </p>"
	    				else return "<p>" + eval("d." + columns[element]) + " </p>"
	    			})
	    			//.on("click",handleclick)
	    	}
	    	$("#"+"dbKwCard-"+dbCounter).draggable();
			$("#"+"dbKwCard-"+dbCounter).resizable();
			//Convert To dataTable
			dataTableAttr=$('#openDataTable'+id).dataTable({
			scrollY: 300,
			"scrollX": true,
			"lengthMenu": [ 25, 50, 75, 100 ]
		});
	    }