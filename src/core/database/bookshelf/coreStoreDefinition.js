'use strict';

const _ = require(`lodash`);

const formatDefinitionToStore = (definition) => {
  return JSON.stringify(
    _.pick(definition, ['settings', 'attributes'])
  );
};

const getDefinitionFromStore = async (definition, orm) => {
  const coreStoreExists = await orm.knex.schema.hasTable('core_store');

  if (!coreStoreExists) {
    return undefined;
  }

  let def;

  const coreStore = app.db.models['core_store'];
  if (coreStore) {
    def = await app.db.models['core_store']
      .forge({key: `model_def_${definition.uid}`})
      .fetch();
  }

  return def ? def.toJSON() : undefined;
};

/**
 * 
 * @param {Object} definition - model's definition
 * @param {Object} orm 
 * 
 * @returns {Object} bookshelf model
 */
const storeDefinition = async (definition, orm) => {
  const defToStore = formatDefinitionToStore(definition);
  const existingDef = await getDefinitionFromStore(definition, orm);

  const defData = {
    key: `model_def_${definition.uid}`,
    type: 'object',
    value: defToStore,
  };

  if (existingDef) {
    return app.db.models[`core_store`].forge({id: existingDef.id}).save(defData)
  }

  return app.db.models[`core_store`].forge(defData).save();
};

const getColumnsWhereDefinitionChanged = async (columnsName, definition, orm) => {
  const previousDefinitionRow = await getDefinitionFromStore(definition, orm);
  const previousDefinition = JSON.parse(_.get(previousDefinitionRow, 'value', null));

  return columnsName.filter(columnName => {
    const previousAttribute = _.get(previousDefinition, ['attributes', columnName], null);
    const actualAttribute = _.get(definition, ['attributes', columnName], null);

    return !_.isEqual(previousAttribute, actualAttribute);
  });
};

module.exports = {
  storeDefinition,
  formatDefinitionToStore,
  getDefinitionFromStore,
  getColumnsWhereDefinitionChanged
};
