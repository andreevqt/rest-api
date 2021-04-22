'use strict';

const queries = require(`./queries`);
const _ = require(`lodash`);
const initKnex = require(`./knex`);
const schemaBuilder = require(`./schemaBuilder`);
const {mountModels} = require(`./mountModels`);
const bookshelf = require(`bookshelf`);

module.exports = (app) => {
  const mountConnection = async (ctx) => {
    const {orm} = ctx;
  
    await mountModels({
      models: {
        'core_store': app.models[`core_store`]
      },
      target: app.models
    }, {
      orm 
    });
  
    await mountModels({
      models: app.models,
      target: app.models
    }, {
      orm
    });
  };
  
  const initialize = async () => {
    initKnex(app); 
  
    const orm = new bookshelf(app.connection);
    await mountConnection({orm});
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
