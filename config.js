require('dotenv').config();

const {getBool} = require(`./src/core/utils/configHelpers`);

module.exports = {
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
