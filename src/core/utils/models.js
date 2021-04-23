'use strict';

const _ = require(`lodash`);

module.exports = {
  getNature: function ({attribute, attributeName, modelName}) {
    const types = {
      current: '',
      other: '',
    };

    const models = app.models;

    if (_.has(attribute, `model`)) {
      types.current = `model`;

      _.forIn(models, (model) => {
        _.forIn(model.attributes, (attribute) => {
          if (_.has(attribute, 'collection') && attribute.collection === modelName) {
            types.other = 'collection';
            return false;
          }
          if (_.has(attribute, `model`)) {
            types.other = `modelD`;
            return false;
          }
        })
      });

    } else if (_.has(attribute, `via`) && _.has(attribute, `collection`)) {
      if (!_.has(models, attribute.collection)) {
        throw new Error(
          `The collection \`${_.upperFirst(
            attribute.collection
          )}\`, used in the attribute \`${attributeName}\` in the model ${_.upperFirst(
            modelName
          )}, is missing from the models`
        );
      }

      const relatedAttribute = models[attribute.collection].attributes[attribute.via];
      if (!relatedAttribute) {
        throw new Error(
          `The attribute \`${attribute.via}\` is missing in the model ${_.upperFirst(attribute.collection)}`
        );
      }

      types.current = 'collection';

      if (
        _.has(relatedAttribute, 'collection') &&
        _.has(relatedAttribute, 'via')
      ) {
        types.other = 'collection';
      } else if (
        _.has(relatedAttribute, 'collection') &&
        !_.has(relatedAttribute, 'via')
      ) {
        types.other = 'collectionD';
      } else if (_.has(relatedAttribute, 'model')) {
        types.other = 'model';
      } else {
        throw new Error(
          `The attribute \`${attribute.via
          }\` is not correctly configured in the model ${_.upperFirst(attribute.collection)}`
        );
      }

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
    } else if (types.current === `modelD` && types.other === `model`) {
      return {
        nature: `oneToOne`,
        verbose: `belongsTo`,
      };
    } else if (
      (types.current === 'model' || types.current === 'modelD') &&
      types.other === 'collection'
    ) {
      return {
        nature: 'manyToOne',
        verbose: 'belongsTo',
      };
    } else if (types.current === 'modelD' && types.other === 'collection') {
      return {
        nature: 'oneToMany',
        verbose: 'hasMany',
      };
    } else if (types.current === 'collection' && types.other === 'model') {
      return {
        nature: 'oneToMany',
        verbose: 'hasMany',
      };
    }

    return undefined;
  },

  defineAssociations: function (model, definition, association, key) {
    if (definition.asssociations === `undefined`) {
      definition.asssociations = [];
    }

    if (!_.has(association, 'collection') && !_.has(association, 'model')) {
      return;
    }

    const targetName = association.model || association.collection || '';
    const targetModel = app.db.getModel(targetName);

    const details = _.get(targetModel, [`attributes`, association.via], {});

    const infos = this.getNature({
      attribute: association,
      attributeName: key,
      modelName: model.toLowerCase()
    });

    if (_.has(association, `collection`)) {
      const ast = {
        alias: key,
        type: `collection`,
        targetUid: targetModel.uid,
        collection: association.collection,
        via: association.via || undefined,
        nature: infos.nature,
        autoPopulate: _.get(association, `autoPopulate`, true),
        dominant: details.dominant !== true,
        filter: details.filter,
        populate: association.populate,
      };

      if (infos.nature === 'manyToMany' && definition.orm === 'bookshelf') {
        ast.tableCollectionName = this.getCollectionName(details, association);
      }

      definition.associations.push(ast);
      return;
    }

    if (_.has(association, `model`)) {
      definition.associations.push({
        alias: key,
        type: `model`,
        targetUid: targetModel,
        via: association.via || undefined,
        nature: infos.nature,
        autoPopulate: _.get(association, `autoPopulate`, true),
        dominant: details.dominant !== true,
        filter: details.filter,
        populate: association.populate
      });
    }
    // const appModels = Object.keys(app.models).reduce((acc, entity) => {

    // });
  },


};
