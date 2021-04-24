'use strict';

const fs = require(`fs`).promises;
const path = require(`path`);
const pluralize = require(`pluralize`);
const {coreStoreModel} = require(`../../utils/coreStore`);
const {storeDefinition} = require(`./coreStoreDefinition`)
const _ = require(`lodash`);
const modelsUtils = require(`../../utils/models`);
const {runMigrations} = require(`./schemaBuilder`);


const mountModels = async ({models, target}, {orm, GLOBALS}) => {
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

    // relations
    Object.keys(definition.attributes).forEach((name) => {
      const details = definition.attributes[name];
      if (details.type !== undefined) {
        return;
      }

      const {nature, verbose} = modelsUtils.getNature({
        attribute: details,
        attributeName: name,
        modelName: model.toLowerCase()
      });

      modelsUtils.defineAssociations(model.toLowerCase(), definition, details, name);

      const globalName = details.model || details.collection || ``;
      const {globalId} = app.db.getModel(globalName.toLowerCase());

      switch (verbose) {
        case `hasOne`: {
          const target = app.models[details.model];
          const FK = _.findKey(target.attributes, (details) => {
            if (
              _.has(details, `model`) &&
              details.model === model &&
              _.has(details, `via`) &&
              details.via === name
            ) {
              return details;
            }
          });

          const columnName = _.get(target.attributes, [FK, `columnName`], FK);
          loadedModel[name] = function () {
            return this.hasOne(GLOBALS[globalId], columnName);
          }

          break;
        }
        case `hasMany`: {
          const columnName = _.get(
            app.models,
            [model.collection, 'attributes', details.via, 'columnName'],
            details.via
          );

          details.virtual = true;

          loadedModel[name] = function() {
            return this.hasMany(GLOBALS[globalId], columnName);
          };

          break;
        }
        case `belongsTo`: {
          loadedModel[name] = function() {
            return this.belongsTo(GLOBALS[globalId], _.get(details, 'columnName', name));
          };
          break;
        }
        // TODO: oneToMany
        default:
          break;
      }
    });

    GLOBALS[definition.globalId] = orm.Model.extend(loadedModel);

    target[model] = _.assign(GLOBALS[definition.globalId], target[model]);
    target[model]._attributes = definition.attributes;

    await runMigrations({definition, orm});
    await storeDefinition(definition, orm);
  };

  for (const model of _.keys(models)) {
    await updateModel(model);
  }
}

module.exports = {
  mountModels
};
