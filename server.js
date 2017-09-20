'use strict'

var express = require('express');
var app = express();
var path = require('path');

var port = 8080;

app.use(express.static(__dirname + '/public'));

app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname + '/index.html'));
});

app.listen(port);
console.log("Express now listening on port " + port);
