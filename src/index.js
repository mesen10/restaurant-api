'use strict';

const express = require('express');
const helmet = require('helmet');

const authRouter = require('./routers/authRouter');
const restaurantRouter = require('./routers/restaurantRouter');
const mealRouter = require('./routers/mealRouter');
const orderRouter = require('./routers/orderRouter');
const orderHistoryRouter = require('./routers/orderHistoryRouter');

const app = express();

app.use(helmet());
app.use(helmet.noSniff());
app.use(express.json());

app.use('/auth', authRouter);
app.use('/restaurant', restaurantRouter);
app.use('/restaurant/:restaurantId/meal', mealRouter);
app.use('/order', orderRouter);
app.use('/orderHistory', orderHistoryRouter);

module.exports = app;
