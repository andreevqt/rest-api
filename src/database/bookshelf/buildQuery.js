'use strict';

const buildWhereClause = ({qb, field, operator, value}) => {
  switch (operator) {
    case `eq`:
      return qb.where(field, value);
    case `ne`:
      return qb.where(field, `!=`, value);
    case `lt`:
      return qb.where(field, `<`, value);
    case `lte`:
      return qb.where(field, `<=`, value);
    case `gt`:
      return qb.where(field, `>`, value);
    case `gte`:
      return qb.where(field, `>=`, value);
    case `in`:
      return qb.whereIn(field, Array.isArray(value) ? value : [value]);
    case `nin`:
      return qb.whereNotIn(field, Array.isArray(value) ? value : [value]);
    case `contains`:
      return qb.whereRaw(`LOWER(??) LIKE LOWER(?)`, [field, `%${value}%`]);
    case `null`:
      return value ? qb.whereNull(field) : qb.whereNotNull(field);
    default:
      throw new Error(`Unhandled whereClause : ${field} ${operator} ${value}`);
  }
}

const buildQuery = ({model, filters}) => (qb) => {

};

module.exports = {
  buildQuery,
  buildWhereClause
};
