'use strict';

const config = require('./src/config/config');
const app = require('./src');
const logger = require('./src/util/logger');
require('./src/config/dbConnection');

const port = config.PORT || 3000;
app.listen(port);

logger.info(`Application has started on port ${port}`);
