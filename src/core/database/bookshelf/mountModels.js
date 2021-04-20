'use strict';

const fs = require(`fs`).promises;
const path = require(`path`);
const pluralize = require(`pluralize`);
const {coreStoreModel} = require(`../../utils/coreStore`);
const _ = require(`lodash`);

/**
 * 
 * @param {String} modelsPath 
 * @param {Object} schemaBuilder
 * @param {Object} bookshelf instance 
 * 
 * @returns {Object}
 */
const mountModels = async (modelsPath, {schemaBuilder}, orm) => {

  /**
   * 
   * @param {String} file 
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

  const models = await files.reduce(async (res, file) => {
    const name = path.parse(file).name;
    const definition = require(`${modelsPath}/${file}`);
    definition.settings.tableName = definition.settings.tableName || pluralize(name);
    const model = await mountModel(definition);
    return Promise.resolve({...res, [name]: model});
  }, Promise.resolve({}));

  const coreStore = mountModel(coreStoreModel);

  return {
    ...models,
    'core_store': coreStore
  };
}

module.exports = {
  mountModels
};
