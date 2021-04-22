'use strict';

const fs = require(`fs`).promises;
const path = require(`path`);
const pluralize = require(`pluralize`);
const {coreStoreModel} = require(`../../utils/coreStore`);
const {storeDefinition} = require(`./coreStoreDefinition`)
const _ = require(`lodash`);
const modelsUtils = require(`../../utils/models`);
const {runMigrations} = require(`./schemaBuilder`);



/* const mountModels = async () => {
  const {modelsPath} = app;
  const {orm, connector: {schemaBuilder}} = app.db;

  const mountModel = async (definition) => {
    await schemaBuilder.runMigrations({definition, orm});

    const loadedModel = _.assign({
      requireFetch: false,
      tableName: definition.settings.tableName,
      associations: [],
    }, definition.options);

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
    definition.options = definition.options || {};

    
    Object.keys(definition.attributes).forEach((name) => {
      const details = definition.attributes[name];
      if (details.type !== undefined) {
        return;
      }

      modelsUtils.defineAssociations(definition, details. name);
    })
    modelsUtils.defineAssociations(definition);

    const model = await mountModel(definition);
    await storeDefinition(definition, orm);

    return Promise.resolve({...res, [name]: model});
  }, Promise.resolve({}));

  app.db.models = {...app.db.models, ...models};
} */

const mountModels = async ({models, target}, {orm}) => {
  const getClient = () => {
    return process.env.NODE_ENV === `test` ? `sqlite3` : app.config.db.client;
  };

  const updateModel = async (model) => {
    const definition = models[model];

    definition.associations = [];
    definition.orm = `bookshelf`;
    definition.client = getClient();
    definition.primaryKey = `id`;
    definition.primaryKeyType = `integer`;

    target[model].allAttributes = {...definition.attributes};

    const loadedModel = _.assign({
      requireFetch: false,
      tableName: definition.tableName,
      associations: [],
    }, definition.options);

    const ormModel = orm.Model.extend(loadedModel);

    target[model] = _.assign(ormModel, target[model]);
    target[model]._attributes = definition.attributes;

    await runMigrations({definition, orm})
    await storeDefinition(definition, orm);
  };

  for (const model of _.keys(models)) {
    await updateModel(model);
  }
}

module.exports = {
  mountModels
};
