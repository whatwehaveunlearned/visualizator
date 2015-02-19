//load db
function loadDb(name){
	//Detect type of file to open
	if(name.split(".")[1]=="csv"){
		d3.csv("datasets/" + name,function(data){
			db =  {
	              name: name,
	              data:data,
	            };
	        databasesObjects.push(db);
		});
	}else if(name.split(".")[1]=="json"){
		d3.json("datasets/" + name,function(data){
			db =  {
	              name: name,
	              data:data,
	            };
	        databasesObjects.push(db);
		});
	}
}

function selectDb(name){
	for (element in databasesObjects){
		if(name==databasesObjects[element].name){
			return databasesObjects[element];
		}
	}
}