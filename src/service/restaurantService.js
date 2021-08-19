'use strict';

const jwt = require('jsonwebtoken');
const { ForbiddenError, UnauthorizedError } = require('../util/errors');
const config = require('../config/config');
const logger = require('../util/logger');

const Restaurant = require('../model/dao/restaurantModel');

const createRestaurant = async (authtoken, name, description) => {
  if (!authtoken) {
    throw new UnauthorizedError('No access token');
  }

  const { username, userType } = jwt.verify(authtoken, config.JWT_KEY);
  logger.info(
    `RestaurantService createRestaurant username:${username} userType:${userType}`
  );

  if (userType === 'private') {
    throw new ForbiddenError('Forbidden');
  }

  const newRestaurant = new Restaurant({
    name,
    description,
    owner: username,
  });

  return await newRestaurant.save();
};

const getAll = async (authtoken) => {
  // Verify token
  const { username, userType } = jwt.verify(authtoken, config.JWT_KEY);
  logger.info(
    `RestaurantService getAll username:${username} userType:${userType}`
  );

  if (userType === 'corporate') {
    return await Restaurant.find({ owner: username }).exec();
  } else {
    return await Restaurant.find({}).exec(); // TODO filter blocked user
  }
};

const updateRestaurant = async (authtoken, id, name, description) => {
  if (!authtoken) {
    throw new UnauthorizedError('No access token');
  }

  const { username, userType } = jwt.verify(authtoken, config.JWT_KEY);
  logger.info(
    `RestaurantService updateRestaurant id:${id} username:${username} userType:${userType}`
  );

  if (userType === 'private') {
    throw new ForbiddenError('Forbidden');
  }

  const restaurant = await Restaurant.findOne({
    _id: id,
    owner: username,
  }).exec();
  logger.info('restaurant', restaurant);
  if (!restaurant) {
    throw new ForbiddenError('Forbidden'); // User doesn't have right to update this resource
  }

  restaurant.name = name;
  restaurant.description = description;

  return await restaurant.save();
};

const deleteRestaurant = async (authtoken, id) => {
  if (!authtoken) {
    throw new UnauthorizedError('No access token');
  }

  const { username, userType } = jwt.verify(authtoken, config.JWT_KEY);
  logger.info(
    `RestaurantService deleteRestaurant id:${id} username:${username} userType:${userType}`
  );

  if (userType === 'private') {
    throw new ForbiddenError('Forbidden');
  }

  const restaurant = await Restaurant.findOne({
    _id: id,
    owner: username,
  }).exec();
  logger.info('restaurant', restaurant);
  if (!restaurant) {
    throw new ForbiddenError('Forbidden'); // User doesn't have right to update this resource
  }

  await Restaurant.deleteOne({
    _id: id,
    owner: username,
  });

  return;
};

module.exports = {
  createRestaurant,
  deleteRestaurant,
  getAll,
  updateRestaurant,
};
