'use strict';

const express = require('express');
const logger = require('../util/logger');
const {
  createMeal,
  deleteMeal,
  getMeals,
  updateMeal,
} = require('../service/mealService');
const { HTTPError } = require('../util/errors');

const router = express.Router({ mergeParams: true });

router.get('/', async (req, res, next) => {
  try {
    logger.info('MealRouter Get /meal');
    const {
      headers: { authtoken },
      params: { restaurantId },
    } = req;

    const resResponse = await getMeals(authtoken, restaurantId);
    res.status(200).json(resResponse);

    return next();
  } catch (err) {
    if (err instanceof HTTPError) {
      res
        .status(err.statusCode)
        .json({ message: err.message, details: err.details });
    }

    return next(err);
  }
});

router.post('/', async (req, res, next) => {
  try {
    logger.info('MealRouter Post /meal');
    const {
      headers: { authtoken },
      body: { name, description, price },
      params: { restaurantId },
    } = req;

    const resResponse = await createMeal(
      authtoken,
      restaurantId,
      name,
      description,
      price
    );
    res.status(200).json(resResponse);

    return next();
  } catch (err) {
    if (err instanceof HTTPError) {
      res
        .status(err.statusCode)
        .json({ message: err.message, details: err.details });
    }

    return next(err);
  }
});

router.put('/:mealId', async (req, res, next) => {
  try {
    const {
      headers: { authtoken },
      body: { name, description, price },
      params: { restaurantId, mealId },
    } = req;
    logger.info(`MealRouter Put /meal/${mealId}`);

    const resResponse = await updateMeal(
      authtoken,
      restaurantId,
      mealId,
      name,
      description,
      price
    );
    res.status(200).json(resResponse);

    return next();
  } catch (err) {
    if (err instanceof HTTPError) {
      res
        .status(err.statusCode)
        .json({ message: err.message, details: err.details });
    }

    return next(err);
  }
});

router.delete('/:mealId', async (req, res, next) => {
  try {
    const {
      headers: { authtoken },
      params: { mealId },
    } = req;
    logger.info(`MealRouter Delete /meal/${mealId}`);

    await deleteMeal(authtoken, mealId);
    res.status(200).json({});

    return next();
  } catch (err) {
    if (err instanceof HTTPError) {
      res
        .status(err.statusCode)
        .json({ message: err.message, details: err.details });
    }

    return next(err);
  }
});

module.exports = router;
