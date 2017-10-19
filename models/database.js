(function(){
  'use strict';

  module.exports = function(){
    // Setup the database
    var mongoose = require('mongoose');
    mongoose.Promise = global.Promise;
    mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost/testing_db', { useMongoClient: true });
    var db = mongoose.connection;
    db.on('error', console.error.bind(console, 'MongoDB connection error:'));
    // Load all other models in this folder
    var exported_model, i, path_fn, files= ['test_instance.js', 'user_test.js'];
    for(i = 0; i < files.length; i++) {
      path_fn = "./" + files[i];
      exported_model = require(path_fn);
      exported_model();
    }
  }
})();
