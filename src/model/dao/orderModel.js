'use strict';

const mongoose = require('mongoose');
const OrderHistory = require('./orderHistoryModel');
const logger = require('../../util/logger');
const Schema = mongoose.Schema;

// create a schema
// This is denormalised schema for fast access
const orderSchema = new Schema({
  username: { type: String, required: true },
  restaurantId: { type: String, required: true },
  restaurantName: { type: String, required: true },
  orderDetails: { type: Object, required: true },
  status: { type: String, required: true },
  total: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
}).post('save', async function (order) {
  try {
    const orderHistory = new OrderHistory({
      orderId: order._id,
      status: order.status,
    });

    await orderHistory.save();
    logger.info('Order history has been recorded', order._id);
  } catch (error) {
    logger.error('Error on post save orderModel', error);
  }
});

// the schema is useless so far
// we need to create a model using it
const Order = mongoose.model('Order', orderSchema);

// make this available to our users in our Node applications
module.exports = Order;
