//Author:Alberto Gonzalez Martinez. LAVA LAB 
//email:agon@hawaii.edu
//agon.whatwehaveunlearned.com
//date: 2015

//########################## GLOBAL VARIABLES DECLARATION ########################################################

var margin = {top: 80, right: 30, bottom: 20, left: 40},
    width = 960 - margin.left - margin.right,
    height = 500 - margin.bottom;

var svgAttr = {width:960,height:600}

//Used to dynamically name the areas
var graphCounter=0;
//Used to dynamically identify db
var dbCounter=0;
//Hold area objects with its information
var areas = [];
//Hold database objects
var databasesObjects = [];
//Database selected
var databasePointer;

//Used to manage Selections
//var dataset = []; //I dont need this to be global?
var selectedItems=[];
var parentsOfSelection=[];

//lasso Array
var lassoArray;

//Monitors menu on/off
var menu = false; 

d3.select("#start")
  .on("click",function(d){
      mainMenu(d3.mouse(this));
  });