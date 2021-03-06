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
  init_dist: {
    type: Number
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
  },
  time_til_move: {
    type: Number
  },
  travel_time: {
    type: Number
  },
  angle_dif: {
    type: Number
  },
  _user_test : { type: Schema.Types.ObjectId, ref: 'UserTest' },
});

module.exports = mongoose.model('TestInstance', TestInstanceSchema);
