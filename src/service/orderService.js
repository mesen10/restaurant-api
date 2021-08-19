'use strict';

const jwt = require('jsonwebtoken');
const {
  ForbiddenError,
  UnauthorizedError,
  NotFoundError,
} = require('../util/errors');
const config = require('../config/config');
const logger = require('../util/logger');
const ORDER_STATUS = require('../const/OrderStatus');

const Order = require('../model/dao/orderModel');
const Restaurant = require('../model/dao/restaurantModel');
const Meal = require('../model/dao/mealModel');

const createOrder = async (authtoken, restaurantId, orderDetails) => {
  if (!authtoken) {
    throw new UnauthorizedError('No access token');
  }

  const { username, userType } = jwt.verify(authtoken, config.JWT_KEY);
  logger.info(
    `OrderService createOrder username:${username} userType:${userType} restaurantId:${restaurantId}`
  );

  if (userType === 'corporate') {
    throw new ForbiddenError('Forbidden');
  }
  // Check if restaurant exists
  // No need to check owner
  // TODO block user
  const restaurant = await Restaurant.findOne({
    _id: restaurantId,
  }).exec();
  if (!restaurant) {
    throw new ForbiddenError('Forbidden'); // User doesn't have right to update this resource
  }

  // Create a list of mealIds
  const mealIds = [];
  orderDetails.forEach((orderItem) => {
    mealIds.push(orderItem.mealId);
  });

  // Get only meals which are in the orderDetails
  const meals = await Meal.find({ restaurantId, _id: { $in: mealIds } }).exec();

  // Are all meals in this restaurant?
  for (let i = 0; i < orderDetails.length; i++) {
    const orderItem = orderDetails[i];
    let found = false;

    for (let j = 0; j < meals.length; j++) {
      if (orderItem.mealId === meals[j].id) {
        orderItem.mealName = meals[j].name;
        orderItem.total = meals[j].price * orderItem.count;
        found = true;
        break;
      }
    }

    if (!found) {
      // There is a meal which is not in this restaurant
      throw new ForbiddenError('Forbidden');
    }
  }

  // calculate total
  let total = 0;
  orderDetails.forEach((orderItem) => {
    total += orderItem.total;
  });

  const newOrder = new Order({
    username,
    restaurantId,
    restaurantName: restaurant.name, // Denormalise for fast responses
    orderDetails,
    status: ORDER_STATUS.PLACED,
    total,
  });

  return await newOrder.save();
};

const getOrders = async (authtoken) => {
  // Verify token
  const { username, userType } = jwt.verify(authtoken, config.JWT_KEY);
  logger.info(
    `OrderService getOrders username:${username} userType:${userType}`
  );

  if (userType === 'private') {
    // Return all orders for that user
    return await Order.find({ username }).exec();
  } else {
    const restaurants = await Restaurant.find({ owner: username }).exec();
    const restaurantIds = [];
    restaurants.forEach((restaurant) => {
      restaurantIds.push(restaurant._id);
    });

    return await Order.find({ restaurantId: { $in: restaurantIds } }).exec();
  }
};

const updateOrderStatus = async (authtoken, orderId, newStatus) => {
  // Verify token
  const { username, userType } = jwt.verify(authtoken, config.JWT_KEY);
  logger.info(
    `OrderService getOrders username:${username} userType:${userType}`
  );

  const order = await Order.findOne({ _id: orderId }).exec();
  if (!order) {
    throw new NotFoundError('Order not found');
  }

  if (userType === 'private') {
    // Private user must be owner to modify order status
    if (order.username !== username) {
      throw new ForbiddenError('Forbidden');
    }

    // Only allow restricted changes
    if (
      order.status === ORDER_STATUS.PLACED &&
      newStatus === ORDER_STATUS.CANCELED
    ) {
      order.status = ORDER_STATUS.CANCELED;
      return await order.save();
    } else if (newStatus === ORDER_STATUS.RECEIVED) {
      order.status = ORDER_STATUS.RECEIVED;
      return await order.save();
    }
  } else {
    let updateStatus = false;

    if (newStatus === ORDER_STATUS.CANCELED) {
      // Corporate user can't cancel
      throw new ForbiddenError('Forbidden');
    }

    // Corporate user can set only three status codes
    if (
      ![
        ORDER_STATUS.PROCESSING,
        ORDER_STATUS.IN_ROUTE,
        ORDER_STATUS.DELIVERED,
      ].includes(newStatus)
    ) {
      throw new ForbiddenError('Forbidden');
    }

    if (
      newStatus === ORDER_STATUS.PROCESSING &&
      order.status === ORDER_STATUS.PLACED
    ) {
      updateStatus = true;
    } else if (
      newStatus === ORDER_STATUS.IN_ROUTE &&
      [ORDER_STATUS.PLACED, ORDER_STATUS.PROCESSING].includes(order.status)
    ) {
      updateStatus = true;
    } else if (
      newStatus === ORDER_STATUS.DELIVERED &&
      [
        ORDER_STATUS.PLACED,
        ORDER_STATUS.PROCESSING,
        ORDER_STATUS.IN_ROUTE,
      ].includes(order.status)
    ) {
      updateStatus = true;
    }

    if (updateStatus) {
      order.status = newStatus;
      return await order.save();
    } else {
      throw new ForbiddenError('Forbidden');
    }
  }
};

module.exports = {
  createOrder,
  getOrders,
  updateOrderStatus,
};
