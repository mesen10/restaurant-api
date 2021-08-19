'use strict';

const express = require('express');
const logger = require('../util/logger');
const { createUser, login } = require('../service/authService');
const { HTTPError } = require('../util/errors');

const router = express.Router();

router.post('/createUser', async (req, res, next) => {
  try {
    logger.info('AuthRouter Post /createUser');
    const {
      body: { username, password, userType },
    } = req;

    const loginResponse = await createUser(username, password, userType);
    res.status(200).json(loginResponse);

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

router.post('/login', async (req, res, next) => {
  try {
    logger.info('AuthRouter Post /login');
    const {
      body: { username, password },
    } = req;

    const loginResponse = await login(username, password);
    res.status(200).json(loginResponse);

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
