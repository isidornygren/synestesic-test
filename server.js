'use strict'

var express = require('express');
var app = express();
var path = require('path');
var mongoose = require('mongoose');
var moment = require('moment');

var port = 8080;

//Set up default mongoose connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost/testing_db');

//Get the default connection
var db = mongoose.connection;
//Bind connection to error event (to get notification of connection errors)
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

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
