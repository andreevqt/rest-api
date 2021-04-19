'use strict';

const _ = require(`lodash`);

const getBool = (envVar, defaultValue) => {
  if (_.isBoolean(envVar)) return envVar;
  if (_.isString(envVar)) {
    if (envVar === 'true') return true;
    if (envVar === 'false') return false;
  }
  return defaultValue;
};

module.exports = {
  getBool
};
