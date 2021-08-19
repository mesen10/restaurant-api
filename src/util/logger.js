const bunyan = require('bunyan');

const logger = bunyan.createLogger({ name: 'Restaurant API' });

module.exports = logger;
