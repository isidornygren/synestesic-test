'use strict'

var express = require('express');
var app = express();
var path = require('path');
var port = 8080;

// set the view engine to ejs
app.set('view engine', 'ejs');

app.use(express.static(__dirname + '/public'));

app.get('/', function(req, res) {
    res.render('pages/index');
});

app.get('/test', function(req, res) {
    res.render('pages/test');
});

app.get('/info', function(req, res) {
    res.render('pages/information');
});

app.listen(port);
console.log("Express now listening on port " + port);
