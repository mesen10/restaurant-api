'use strict';

const express = require('express');
const logger = require('../util/logger');
const {
  createRestaurant,
  deleteRestaurant,
  getAll,
  updateRestaurant,
} = require('../service/restaurantService');
const { HTTPError } = require('../util/errors');

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    logger.info('RestaurantRouter Get /restaurant');
    const {
      headers: { authtoken },
    } = req;

    const resResponse = await getAll(authtoken);
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
    logger.info('RestaurantRouter Post /restaurant');
    const {
      headers: { authtoken },
      body: { name, description },
    } = req;

    const resResponse = await createRestaurant(authtoken, name, description);
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

router.put('/:id', async (req, res, next) => {
  try {
    const {
      headers: { authtoken },
      body: { name, description },
      params: { id },
    } = req;
    logger.info(`RestaurantRouter Put /restaurant/${id}`);

    const resResponse = await updateRestaurant(
      authtoken,
      id,
      name,
      description
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

router.delete('/:id', async (req, res, next) => {
  try {
    const {
      headers: { authtoken },
      params: { id },
    } = req;
    logger.info(`RestaurantRouter Delete /restaurant/${id}`);

    await deleteRestaurant(authtoken, id);
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
