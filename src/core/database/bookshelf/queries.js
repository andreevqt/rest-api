'use strict';

const _ = require(`lodash`);
const {buildQuery, } = require(`./buildQuery`);
const {convertFilters} = require(`./convertFilters`)

module.exports = ({model, app}) => {
  const relationsTypes = [
    `hasOne`,
    `belongsTo`,
    `morphOne`,
    `hasMany`,
    `morphMany`,
    `morphTo`,
    `through`
  ];

  const selectAttributes = (attributes) => {
    return _.pickBy(attributes, ({type}, key) => {
      return !relationsTypes.includes(type);
    });
  };

  const selectRelations = (attributes) => {
    return _.pickBy(attributes, ({type}, key) => {
      return relationsTypes.includes(type);
    });
  };

  const convertParams = (params) => {
    const {start, limit, sort, where, ...rest} = params;
    const result = {};
    if (start) {
      result.start = start;
    }

    if (limit) {
      result.limit = limit;
    }

    if (sort) {
      result.sort = sort;
    }

    result.where = where
      ? convertFilters(where)
      : convertFilters(rest);

    return result;
  };

  const find = (params, populate, {transacting} = {}) => {
    const filters = convertParams(params);
    const query = buildQuery({filters});
    return model
      .query(query)
      .fetchAll({
        withRelated: populate,
        transacting
      })
      .then((models) => models.toJSON());
  };

  const findOne = async (params, populate, {transacting} = {}) => {
    const results = await find(params, populate, transacting);
    return results[0] || null;
  };

  const create = async (attributes, {transacting} = {}) => {
    const data = {...selectAttributes(attributes)};
    return (await model.forge(data).save(null, {transacting})).toJSON();
  };

  return {
    find,
    findOne,
    create
  };
}
