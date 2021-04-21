'use strict';

const fs = require(`fs`).promises;
const path = require(`path`);
const pluralize = require(`pluralize`);
const {coreStoreModel} = require(`../../utils/coreStore`);
const {storeDefinition} = require(`./coreStoreDefinition`)
const _ = require(`lodash`);

const getClient = () => {
  return process.env.NODE_ENV === `test` ? `sqlite3` : app.config.db.client;
}

/**
 * 
 * @param {String} modelsPath 
 * @param {Object} schemaBuilder
 * @param {Object} bookshelf instance 
 * 
 * @returns {Object}
 */
const mountModels = async () => {
  const {modelsPath} = app;
  const {orm, connector: {schemaBuilder}} = app.db;

  /**
   * 
   * @param {Object} definition 
   * 
   * @returns {Object}
   */
  const mountModel = async (definition) => {
    await schemaBuilder.runMigrations({definition, orm});

    const loadedModel = _.assign({
      requireFetch: false,
      tableName: definition.settings.tableName,
      associations: [],
    });

    return orm.Model.extend(loadedModel);
  };

  const files = await fs.readdir(modelsPath);

  const coreStore = await mountModel(coreStoreModel);
  app.db.models = {'core_store': coreStore};

  const models = await files.reduce(async (res, file) => {
    const name = path.parse(file).name;
    const plural = pluralize(name);

    const definition = require(`${modelsPath}/${file}`);
    definition.uid = definition.uid || `model::${plural}`;
    definition.settings.tableName = definition.settings.tableName || plural;
    definition.client = getClient();
    definition.associations = [];

    const model = await mountModel(definition);
    await storeDefinition(definition, orm);

    return Promise.resolve({...res, [name]: model});
  }, Promise.resolve({}));

  app.db.models = {...app.db.models, ...models};
}

const mountCoreStore = () => {
  
}

module.exports = {
  mountModels,
  mountCoreStore
};
