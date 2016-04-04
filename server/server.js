//Lets require/import the HTTP module
var http = require('http');
var express = require('express')
var morgan = require('morgan')
//var dispatcher = require('dispatcher')

var hostname = "localhost"
//Lets define a port we want to listen to
const PORT=8080;

var app = express();

app.use(morgan('dev'));

app.use(express.static(__dirname + '/../public'))

//Lets start our server
app.listen(PORT, hostname, function(){
    //Callback triggered when server is successfully listening. Hurray!
    console.log(__dirname + './public')
    console.log('Server listening on: http://' + hostname+ ':' + PORT +'/');
});
