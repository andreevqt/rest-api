'use strict';

const fs = require(`fs`).promises;
const path = require(`path`);

const mountModels = async (modelsPath, orm) => {
  const files = await fs.readdir(modelsPath);
  return files.reduce(async (res, file) => {
    let properties = {};

    const name = path.parse(file).name;
    properties.name = name;
    properties.path = `${modelsPath}/${file}`;
    properties.definition = require(properties.path);
    properties.orm = orm;

    await orm.createOrUpdateTable(properties);

    properties.internalModel = orm.internal({
      orm,
      tableName: properties.definition.settings.tableName,
      name
    });

    return Promise.resolve({...res, [name]: properties});
  }, Promise.resolve({}));
}

module.exports = {
  mountModels
};
