'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// create a schema
// This is denormalised schema for fast access
const orderHistorySchema = new Schema({
  orderId: { type: String, required: true },
  status: { type: String, required: true },
  updatedAt: { type: Date, default: Date.now },
});

// the schema is useless so far
// we need to create a model using it
const OrderHistory = mongoose.model('OrderHistory', orderHistorySchema);

// make this available to our users in our Node applications
module.exports = OrderHistory;
