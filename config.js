'use strict';

require('dotenv').config();

const _ = require(`lodash`);
const {getBool} = require(`./src/core/utils/configHelpers`);

const options = {
  debug: getBool(process.env.debug, false),
  db: {
    client: `mysql`,
    host: process.env.DB_HOST || `localhost`,
    database: process.env.DB_NAME || `test`,
    user: process.env.DB_USER || `root`,
    password: process.env.DB_PASSWORD || ``,
    charset: `utf8`
  }
};

const set = (key, value) => {
  return _.set(options, key, value);
};

const get = (key) => {
  return _.get(options, key);  
};

module.exports = {
  set,
  get
};
