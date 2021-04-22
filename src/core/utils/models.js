'use strict';

const _ = require(`lodash`);

module.exports = {
  defineAssociations: (model, definition, association, key) => {
    if (definition.asssociations === `undefined`) {
      definition.asssociations = [];
    }

    if (!_.has(association, `model`)) {
      return;
    }

    let details;

    const targetName = association.model || '';

    const targetModel = app.getModel(targetName);

    const infos = this.getNature( {
      
    });

  },

  getNature: ({attribute, attributeName, modelName}) => {
    const types = {
      current: '',
      other: '',
    };

    const models = app.models;

    if (_.has(attribute, `model`)) {
      types.current = `model`;
      _.forIn(models, (model) => {
        _.forIn(model.attributes, (attribute) => {
          if (_.has(attribute, `model`)) {
            types.other = `modelD`;
            return false;
          }
        })
      });
      
    } else {
      throw new Error(
        `The attribute \`${attributeName}\` is not correctly configured in the model ${_.upperFirst(
          modelName
        )}`
      );
    }

    if (types.current === `model` && types.other === `modelD`) {
      return {
        nature: `oneToOne`,
        verbose: `hasOne`,
      };
    }
  }
};
