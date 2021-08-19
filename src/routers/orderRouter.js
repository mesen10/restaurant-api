'use strict';

const express = require('express');
const logger = require('../util/logger');
const {
  createOrder,
  getOrders,
  updateOrderStatus,
} = require('../service/orderService');
const { HTTPError } = require('../util/errors');

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    logger.info('OrderRouter Get /order');
    const {
      headers: { authtoken },
    } = req;

    const resResponse = await getOrders(authtoken);
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
    logger.info('OrderRouter Post /order');
    const {
      headers: { authtoken },
      body: { restaurantId, orderDetails },
    } = req;

    const orderResponse = await createOrder(
      authtoken,
      restaurantId,
      orderDetails
    );
    res.status(200).json(orderResponse);

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

router.patch('/:orderId', async (req, res, next) => {
  try {
    const {
      headers: { authtoken },
      body: { status },
      params: { orderId },
    } = req;
    logger.info(`OrderRouter Patch /order/${orderId}`);

    const orderResponse = await updateOrderStatus(authtoken, orderId, status);
    res.status(200).json(orderResponse);

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
