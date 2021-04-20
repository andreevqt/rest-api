'use strict';

let knex;

const connect = async () => {
  const {config} = app;
  
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

  return knex;
};

const close = async () => {
  return knex.destroy();
};

module.exports = {
  connect,
  close
};
