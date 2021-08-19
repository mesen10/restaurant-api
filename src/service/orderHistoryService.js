'use strict';

const jwt = require('jsonwebtoken');
const {
  ForbiddenError,
  UnauthorizedError,
  NotFoundError,
} = require('../util/errors');
const config = require('../config/config');
const logger = require('../util/logger');

const Restaurant = require('../model/dao/restaurantModel');
const Order = require('../model/dao/orderModel');
const OrderHistory = require('../model/dao/orderHistoryModel');

const getAll = async (authtoken, orderId) => {
  // Verify token
  const { username, userType } = jwt.verify(authtoken, config.JWT_KEY);
  logger.info(
    `OrderHistoryService getAll username:${username} userType:${userType} orderId:${orderId}`
  );

  if (userType === 'private') {
    const order = await Order.findOne({ _id: orderId, username }).exec();
    if (!order) {
      throw new ForbiddenError('Forbidden');
    }
  } else {
    const restaurants = await Restaurant.find({ owner: username });
    if (!restaurants) {
      throw new ForbiddenError('Forbidden');
    }
    const restaurantIds = [];
    restaurants.forEach((restaurant) => {
      restaurantIds.push(restaurant.id);
    });

    const order = await Order.findOne({
      _id: orderId,
      restaurantId: { $in: restaurantIds },
    }).exec();
    if (!order) {
      throw new ForbiddenError('Forbidden');
    }
  }

  // All checks are done
  return await OrderHistory.find({ orderId }).exec();
};

module.exports = {
  getAll,
};
