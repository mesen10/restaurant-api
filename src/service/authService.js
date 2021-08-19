'use strict';

const sha256 = require('js-sha256').sha256;
const jwt = require('jsonwebtoken');
const { DuplicateError, UnauthorizedError } = require('../util/errors');
const config = require('../config/config');
const logger = require('../util/logger');

const User = require('../model/dao/userModel');

const createUser = async (username, password, userType = 'private') => {
  const usernameExists = await User.findOne({ username }).exec();
  if (usernameExists) {
    throw new DuplicateError('User exists');
  }

  const newUser = new User({
    username,
    password: sha256(password),
    userType,
  });

  await newUser.save();

  // Create a JWT token
  const token = jwt.sign({ username, userType }, config.JWT_KEY);
  return { token, userType };
};

const login = async (username, password) => {
  const userInfo = await User.findOne({
    username,
    password: sha256(password),
  }).exec();

  if (!userInfo) {
    throw new UnauthorizedError('Wrong password');
  }

  // Create a JWT token
  const token = jwt.sign(
    { username, userType: userInfo.userType },
    config.JWT_KEY
  );
  return { token, userType: userInfo.userType };
};

module.exports = { createUser, login };
