'use strict'

var express = require('express');
var app = express();
var path = require('path');
var bodyParser = require('body-parser');
var jwt = require('jsonwebtoken');
var mongoose = require('mongoose');

// Connect to the database
var database = require('./models/database.js');
database();
var TestInstance = mongoose.model('TestInstance')
var UserTest = mongoose.model('UserTest')

// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var port = process.env.PORT || 8080;

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
    next(); // make sure we go to the next routes and don't stop here
});

router.route('/usertest')
  .post(function(req, res){
    var user = new UserTest();
    var ip = req.headers['x-forwarded-for'] ||
     req.connection.remoteAddress ||
     req.socket.remoteAddress ||
     req.connection.socket.remoteAddress || '0';
    var user_token = jwt.sign({
      data: ip
    }, process.env.SECRET_KEY || 'very_secret_key', { expiresIn: '2h' });
    user.ip = ip;
    user.token = user_token;
    user.country = req.body.country;
    user.birthyear = req.body.birthyear;
    user.sex = req.body.sex;
    user.input = req.body.input;
    user.save(function(err, new_user){
      if(err){
        res.send(err);
        console.log('API error: ' + err + '.')
      }else{
        res.json({message: 'user saved.', key: user_token, id:new_user._id});
        console.log('New user created: "' + new_user.id + '".')
      }
    });
  });
router.route('/testinstance')
  .post(function(req, res){
    var test = new TestInstance();
    // Check the test id
    jwt.verify(req.body.token, process.env.SECRET_KEY || 'very_secret_key', function(err, decoded){
      if(err){
        console.log('Test instance error: ' + err + '.');
        res.send(err);
      }else{
        // Key is correct and valid
        UserTest.findById(req.body.id, function(err, user_test){
          if(err){
            console.log('Could not apply test instance to user: ' + err + '.');
            res.send(err);
          }else{
            test._user_test = user_test;
            test.test_num = req.body.test_num;
            test.test_seq = req.body.test_seq;
            test.init_v = {
              angle: req.body.init_v_angle,
              force: req.body.init_v_force
            };
            test.goal_v = {
              angle: req.body.goal_v_angle,
              force: req.body.goal_v_force
            };
            test.init_dist = req.body.init_dist;
            test.time_til_move = req.body.time_til_move;
            test.travel_time = req.body.travel_time;
            test.angle_dif = req.body.angle_dif;
            test.time = req.body.time;
            test.save(function(err, new_test){
              if(err){
                res.send(err);
              }else{
                user_test.test_instances.push(new_test);
                res.json({message: 'test instance saved.', id: new_test._id});
                console.log('New test instance saved: "' + new_test._id +'".');
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
