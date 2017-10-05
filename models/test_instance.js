'use strict';
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var TestInstanceSchema = new Schema({
  test_num: {
    type: Number,
  },
  test_seq: {
    type: Number,
  },
  init_v: {
    angle: {
      type:Number
    },
    force: {
      type: Number
    },
  },
  goal_v: {
    angle: {
      type: Number
    },
    force: {
      type: Number
    },
  },
  time: {
    type: Number
  }
});

module.exports = mongoose.model('TestInstance', TestInstanceSchema);
