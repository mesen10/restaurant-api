'use strict';

const express = require('express');
const logger = require('../util/logger');
const { getAll } = require('../service/orderHistoryService');
const { HTTPError } = require('../util/errors');

const router = express.Router();

router.get('/:orderId', async (req, res, next) => {
  try {
    const {
      headers: { authtoken },
      params: { orderId },
    } = req;
    logger.info(`OrderHistoryRouter Get /order/${orderId}`);

    const resResponse = await getAll(authtoken, orderId);
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

module.exports = router;
