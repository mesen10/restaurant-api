'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// create a schema
// This is denormalised schema for fast access
const restaurantSchema = new Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  owner: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

// the schema is useless so far
// we need to create a model using it
const Restaurant = mongoose.model('Restaurant', restaurantSchema);

// make this available to our users in our Node applications
module.exports = Restaurant;
