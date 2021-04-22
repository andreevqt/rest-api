'use strict';

const contentTypes = require(`../utils/contentTypes`);

module.exports = (app) => {

  app.models = Object.keys(app.api || []).reduce((acc, apiName) => {
    const api = app.api[apiName];
    for (let modelName in api.models) {
      const model = app.api[apiName].models[modelName];
      contentTypes.createContentType(model, {modelName}, {apiName});

      // core api ?
      acc[modelName] = model;
    }

    return acc;
  }, {});
};
