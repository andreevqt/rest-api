'use strict';

const fs = require(`fs`).promises;
const path = require(`path`);
const pluralize = require(`pluralize`);
const {coreStoreModel}  = require(`../utils/coreStore`);

/**
 * 
 * @param {String} modelsPath 
 * @param {Object} orm 
 * 
 * @returns {Object}
 */
const mountModels = async (modelsPath, orm) => {
  
  /**
   * 
   * @param {String} file 
   * 
   * @returns {Object}
   */
  const mountModel = async (file) => {
    let properties = {};

    const name = path.parse(file).name;
    properties.name = name;
    properties.path = `${modelsPath}/${file}`;
    properties.definition = require(properties.path);
    properties.orm = orm;

    await orm.createOrUpdateTable(properties);

    properties.internalModel = orm.internal({
      orm,
      tableName: properties.definition.settings.tableName
        || pluralize(name),
      name
    });

    return properties;
  };

  const mountCoreStore = async () => {
    let properties = {}
    properties.name = `core-store`;
    properties.definition = coreStoreModel;
    properties.path = ``;
    properties.orm = orm;

    await orm.createOrUpdateTable(properties);

    properties.internalModel = orm.internal({
      orm,
      tableName: `core-store`,
      name: `core-store`
    });
  };

  const files = await fs.readdir(modelsPath);

  const models = await files.reduce(async (res, file) => {
    const {name, ...properties} = await mountModel(file, modelsPath);
    return Promise.resolve({...res, [name]: properties});
  }, Promise.resolve({}));

  const coreStore = await mountCoreStore();

  return {...models, 'core-store': coreStore};
}

module.exports = {
  mountModels
};
