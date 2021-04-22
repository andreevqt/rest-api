'use strict';

const fs = require(`fs`).promises;
const path = require(`path`);
const pluralize = require(`pluralize`);
const {coreStoreModel} = require(`../../utils/coreStore`);
const {storeDefinition} = require(`./coreStoreDefinition`)
const _ = require(`lodash`);
const modelsUtils = require(`../../utils/models`);
const {runMigrations} = require(`./schemaBuilder`);


const mountModels = async ({models, target}, {orm}) => {
  const getClient = () => {
    return process.env.NODE_ENV === `test` ? `sqlite3` : app.config.get(`db.client`);
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
