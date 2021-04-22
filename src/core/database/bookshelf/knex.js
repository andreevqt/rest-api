'use strict';

const _ = require(`lodash`);

const init = async (app) => {
  const {config} = app;

  let knex;
  
  if (process.env.NODE_ENV === `test`) {
    knex = require(`knex`)({
      client: `sqlite3`,
      connection: {
        filename: `:memory:`
      },
      debug: config.get(`db.debug`),
      useNullAsDefault: true
    });
  } else {
    knex = require(`knex`)({
      debug: config.get(`db.debug`),
      client: config.get(`db.client`),
      connection: config.get(`db`)
    });
  }

  // set app connection
  app.connection = knex;
  return knex;
};

module.exports = init;
