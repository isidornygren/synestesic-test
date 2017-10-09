'use strict'

var express = require('express');
var app = express();
var path = require('path');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var jwt = require('jsonwebtoken');

// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

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
    res.render('pages/test', { test_id : req.id, test_num: req.num });
});

app.get('/info', function(req, res) {
    res.render('pages/information');
});

// API
var router = express.Router();

var TestInstance = require('./models/test_instance');
var UserTest = require('./models/user_test');

// middleware to use for all requests
router.use(function(req, res, next) {
    // do logging
    console.log('Something is happening.');
    next(); // make sure we go to the next routes and don't stop here
});
router.route('/usertest')
  .post(function(req, res){
    var user = new UserTest();
    var ip = req.headers['x-forwarded-for'] ||
     req.connection.remoteAddress ||
     req.socket.remoteAddress ||
     req.connection.socket.remoteAddress;
    var user_token = jwt.sign({
      data: ip
    }, process.env.SECRET_KEY || 'very_secret_key', { expiresIn: '2h' });
    // Save user ip for the future
    user.ip = ip;
    user.token = user_token;
    user.country = req.body.country;
    user.birthyear = req.body.birthyear;
    user.sex = req.body.sex;
    user.save(function(err, new_user){
      if(err){
        res.send(err);
      }else{
        res.json({message: 'user saved.', key: user_token, id:new_user._id});
      }
    });
  });
router.route('testinstance')
  .post(function(req, res){
    var test = new TestInstance();
    // Check the test id

    jwt.verify(req.body.key, process.env.SECRET_KEY || 'very_secret_key', function(err, dec){
      if(err){
        res.send(err);
      }else{
        // Key is correct and valid
        console.log(decoded.data);
        UserTest.findById(req.body.id, function(err, user_test){
          if(err){
            res.send(err);
          }else{
            console.log('found user:' + user_test.ip + ':' + user_test.country + ':' + user_test.birthyear + ':' + user_test.sex + ':' + user_test.token);
            test._user_test = user_test._id;
            test.test_num = req.body.test_num;
            test.test_seq = req.body.test_seq;
            test.init_v = {
              angle: req.body.init_v.angle,
              force: req.body.init_v.force
            };
            test.goal_v = {
              angle: req.body.goal_v.angle,
              force: req.body.goal_v.force
            };
            test.time = req.body.time;
            test.save(function(err, new_test){
              if(err){
                res.send(err);
              }else{
                user_test.test_instances.push(new_test);
                res.json({message: 'test instance saved.'})
              }
            });
          }
        });
      }
    });
  });

app.use('/api', router);

app.listen(port);
console.log("Express now listening on port " + port);
