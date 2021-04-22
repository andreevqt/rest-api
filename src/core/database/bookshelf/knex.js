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
      debug: config.debug,
      useNullAsDefault: true
    });
  } else {
    knex = require(`knex`)({
      debug: config.debug,
      client: config.db.client,
      connection: config.db
    });
  }

  // set app connection
  app.connection = knex;
  return knex;
};

const close = async () => {
  return knex.destroy();
};

module.exports = init;
