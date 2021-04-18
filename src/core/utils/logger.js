const pino = require('pino');
const _ = require('lodash');

const logLevels = Object.keys(pino.levels.values);

function getLogLevel() {
  if (!_.isString(process.env.STRAPI_LOG_LEVEL)) {
    // Default value.
    return 'debug';
  }

  const logLevel = process.env.STRAPI_LOG_LEVEL.toLowerCase();

  if (!_.includes(logLevels, logLevel)) {
    throw new Error(
      "Invalid log level set in APP_LOG_LEVEL environment variable. Accepted values are: '" +
      logLevels.join("', '") +
      "'."
    );
  }

  return logLevel;
}

function getBool(envVar, defaultValue) {
  if (_.isBoolean(envVar)) return envVar;
  if (_.isString(envVar)) {
    if (envVar === 'true') return true;
    if (envVar === 'false') return false;
  }
  return defaultValue;
}

const loggerConfig = {
  level: getLogLevel(),
  timestamp: getBool(process.env.APP_LOG_TIMESTAMP, true),
  // prettyPrint: getBool(process.env.STRAPI_LOG_PRETTY_PRINT, true),
  forceColor: getBool(process.env.APP_LOG_FORCE_COLOR, true),
  prettyPrint: getBool(process.env.APP_LOG_PRETTY_PRINT, true)
};

const destination = !getBool(process.env.APP_LOG_PRETTY_PRINT, true) && pino.destination(`logs/app.log`);

module.exports = pino(loggerConfig,
  destination
);
