'use strict';

const _ = require(`lodash`);
const pluralize = require(`pluralize`);

const pickSchema = model => {
  const schema = _.cloneDeep(
    _.pick(model, [
      'info',
      'options',
      'attributes',
    ])
  );

  return schema;
};

const createContentType = (model, {modelName}, {apiName}) => {
  if (apiName) {
    Object.assign(model, {
      uid: `app::${apiName}.${modelName}`,
      apiName
    });
  } else {
    Object.assign(model, {
      uid: `core::${modelName}`
    });
  }

  Object.assign(model, {
    __schema__: pickSchema(model),
    modelType: 'contentType',
    modelName,
    tableName: model.tableName || pluralize(modelName),
    options: model.options || {}
  });
};

module.exports = {
  createContentType
};
