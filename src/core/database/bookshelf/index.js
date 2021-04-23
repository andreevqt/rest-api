'use strict';

const queries = require(`./queries`);
const _ = require(`lodash`);
const initKnex = require(`./knex`);
const schemaBuilder = require(`./schemaBuilder`);
const {mountModels} = require(`./mountModels`);
const bookshelf = require(`bookshelf`);

module.exports = (app) => {
  const mountConnection = async (ctx) => {
    await mountModels({
      models: {
        'core_store': app.models[`core_store`]
      },
      target: app.models
    }, ctx);

    await mountModels({
      models: app.models,
      target: app.models
    }, ctx);
  };

  const initialize = async () => {
    initKnex(app);

    const GLOBALS = {};
    const orm = new bookshelf(app.connection);
    await mountConnection({orm, GLOBALS});
  };

  const close = async () => {
    await app.connection.destroy();
  };

  return {
    initialize,
    close,
    queries,
    schemaBuilder
  }
}
