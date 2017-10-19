'use strict'

var CronJob = require('cron').CronJob;
var mongoXlsx = require('mongo-xlsx');
var mongoose = require('mongoose');
const prettyBytes = require('pretty-bytes');

// Connect to the database
var database = require('./models/database.js');
database();
var TestInstance = mongoose.model('TestInstance')
var UserTest = mongoose.model('UserTest')
var fs = require('fs');

console.log('Exporting the database as an excel file');
// generate the new excel data
var data = TestInstance.find({}, function(err, usertests){
  console.log('Found ' + usertests.length + ' instance(s) of usertests.');
  if(err){
    console.log(err);
    process.exit();
  }else{
    var model = mongoXlsx.buildDynamicModel(usertests);
    mongoXlsx.mongoData2Xlsx(usertests, model, {fileName: 'exported_data.xlsx', path: './public/exports/'}, function(err, data) {
      if(err){
        console.log('Error exporting data: ' + err);
      }else{
        console.log('Exporting finished. File saved at:', data.fullPath, prettyBytes(data.size));
        fs.exists(data.fullPath, function(exists){
          if(exists){
            console.log('Found exported file.');
            process.exit();
          }else{
            console.log('Could not find exported file.');
            process.exit();
          }
        });
      }
      // The worker is finished
    });
  }
}).populate('_user_test');
