'use strict'

var CronJob = require('cron').CronJob;
var mongoXlsx = require('mongo-xlsx');
var mongoose = require('mongoose');

// Connect to the database
//mongoose.Promise = global.Promise;
//mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost/testing_db', { useMongoClient: true });
//var db = mongoose.connection;
//db.on('error', console.error.bind(console, 'MongoDB connection error:'));
var database = require('./models/database.js');
database();
var TestInstance = mongoose.model('TestInstance')
var UserTest = mongoose.model('UserTest')


console.log('Exporting the database as an excel file');
// generate the new excel data
var data = TestInstance.find({}, function(err, usertests){
  console.log('Found ' + usertests.length + ' instance(s) of usertests.');
  if(err){
    console.log(err);
    process.exit();
  }else{
    var model = mongoXlsx.buildDynamicModel(usertests);
    mongoXlsx.mongoData2Xlsx(usertests, model, {fileName: 'exported_data.xlsx', path: 'public/exports/'}, function(err, data) {
      console.log('Exporting finished. File saved at:', data.fullPath);
      // The worker is finished
      process.exit();
    });
  }
}).populate('_user_test');
