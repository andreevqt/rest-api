'use strict';

const _ = require(`lodash`);

const models = {
  defineAssociations: (definition, association, key) => {
    if (definition.asssociations === `undefined`) {
      definition.asssociations = [];
    }

    if (!_.has(association, `model`)) {
      return;
    }

    let details;

    const targetName = association.model || '';

  },

  getNature: (attribute, attributeName, modelName) => {

  }

};

module.exports = models;
