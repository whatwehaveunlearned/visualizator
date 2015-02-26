//load db
function loadDb(name,id){
	if(name.split(".")[1]=="csv"){
		d3.csv("datasets/" + name,function(data){
			//ADD UNIQUE KEY FOR EACH DB ELEMENT
			var counter = 0;
			for(each in data){
				data[each]['myId']=counter;
				counter++; 
			}
			if (data instanceof Array){
				db =  {
				  id: id,
	              name: name,
	              metadata:"false",
	              data:data
	            };
			}else{
				db =  {
				  id: id,
	              name: name,
	              metadata:data.meta,
	              data:data.data
	            };
			}
	        databasesObjects.push(db);
		});
	}else if(name.split(".")[1]=="json"){
		d3.json("datasets/" + name,function(data){
			//ADD UNIQUE KEY FOR EACH DB ELEMENT
			var counter = 0;
			for(each in data){
				data[each]['myId']=counter;
				counter++; 
			}
			if (data instanceof Array){
				db =  {
				  id: id,
	              name: name,
	              metadata:"false",
	              data:data
	            };
			}else{
				db =  {
				  id: id,
	              name: name,
	              metadata:data.meta,
	              data:data.data
	            };
			}
	        databasesObjects.push(db);
		});
	}
	dbCounter=dbCounter+1;
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