'use strict';

const jwt = require('jsonwebtoken');
const { ForbiddenError, UnauthorizedError } = require('../util/errors');
const config = require('../config/config');
const logger = require('../util/logger');

const Meal = require('../model/dao/mealModel');
const Restaurant = require('../model/dao/restaurantModel');

const createMeal = async (
  authtoken,
  restaurantId,
  name,
  description,
  price
) => {
  if (!authtoken) {
    throw new UnauthorizedError('No access token');
  }

  const { username, userType } = jwt.verify(authtoken, config.JWT_KEY);
  logger.info(
    `MealService createMeal username:${username} userType:${userType} restaurantId:${restaurantId}`
  );

  if (userType === 'private') {
    throw new ForbiddenError('Forbidden');
  }
  const restaurant = await Restaurant.findOne({
    _id: restaurantId,
    owner: username,
  }).exec();
  if (!restaurant) {
    throw new ForbiddenError('Forbidden'); // User doesn't have right to update this resource
  }

  const newMeal = new Meal({
    name,
    description,
    price,
    owner: username,
    restaurantId,
  });

  return await newMeal.save();
};

const getMeals = async (authtoken, restaurantId) => {
  // Verify token
  const { username, userType } = jwt.verify(authtoken, config.JWT_KEY);
  logger.info(
    `MealService getMeals username:${username} userType:${userType} restaurantId:${restaurantId}`
  );

  // Return all meals for that restaurant
  return await Meal.find({ restaurantId }).exec();
};

const updateMeal = async (
  authtoken,
  restaurantId,
  mealId,
  name,
  description,
  price
) => {
  if (!authtoken) {
    throw new UnauthorizedError('No access token');
  }

  const { username, userType } = jwt.verify(authtoken, config.JWT_KEY);
  logger.info(
    `MealService updateMeal username:${username} userType:${userType} restaurantId:${restaurantId} mealId:${mealId}`
  );

  if (userType === 'private') {
    throw new ForbiddenError('Forbidden');
  }
  const meal = await Meal.findOne({
    _id: mealId,
    owner: username,
  }).exec();
  if (!meal) {
    throw new ForbiddenError('Forbidden'); // User doesn't have right to update this resource
  }

  meal.name = name;
  meal.description = description;
  meal.price = price;

  return await meal.save();
};

const deleteMeal = async (authtoken, mealId) => {
  if (!authtoken) {
    throw new UnauthorizedError('No access token');
  }

  const { username, userType } = jwt.verify(authtoken, config.JWT_KEY);
  logger.info(
    `MealService deleteMeal username:${username} userType:${userType} mealId:${mealId}`
  );

  if (userType === 'private') {
    throw new ForbiddenError('Forbidden');
  }

  const meal = await Meal.findOne({
    _id: mealId,
    owner: username,
  }).exec();
  if (!meal) {
    throw new ForbiddenError('Forbidden'); // User doesn't have right to update this resource
  }

  await Meal.deleteOne({
    _id: mealId,
    owner: username,
  });

  return;
};

module.exports = {
  createMeal,
  deleteMeal,
  getMeals,
  updateMeal,
};
