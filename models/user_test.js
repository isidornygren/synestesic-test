'use strict';
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var UserTestSchema = new Schema({
  ip: {
    type: String, // Should store as binary lol
  },
  token: {
    type: String,
  },
  country: {
    type: String,
  },
  birthyear: {
    type: Number,
  },
  sex: {
    type: String, // male/female as to not push too many buttons
  },
  test_instances : [{ type: Schema.Types.ObjectId, ref: 'TestInstance' }]
});

module.exports = mongoose.model('UserTest', UserTestSchema);
