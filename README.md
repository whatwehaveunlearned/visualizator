# visualizator
d3 visualizator for SAGE

Use:

  1. Select .csv or .json files and drop them in the datasets folder of the project.
  
  2. Run listData.py from a terminal. The file is in the root of the project.
  
  3. Launch an http server from the root folder.
  
    For example in python:
    
      Execute this in the terminal 
      
        $python -m SimpleHTTPServer 8888
        
  4. Browse in chrome to http://localhost:8888/main.html
  
    Click here for amazing Viz
    
    Add Db: Selects a db from the database folder.
    
    Create New Graph: Lets you create a new graph from a previously added Db.
    
    Minimize: Minimizes the menu as a red dot.

System Models:

areas: Array that holds visualizations objects.

    children: Array of children Areas
    data: data of Area
    database: database of data of Area
    name: Name of Area
    parent: Array of Parent Areas
    title: Name of the Area
    type: Type of the Area (histogram,scatterplot)
    xAxis: Name of x Axis
    yAxis: Name of y Axis
    
dataBasesList: List of databases created by listData.py.

databasesObjects: Array that holds visualizations objects.

    data: Array of children Areas
    metadata: Either "false" if no metadata present or the metadata object of the database
    id: identifier number of the database
    name: name of the database file

  
