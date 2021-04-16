'use strict';

const convertFilter = (key, value) => {
  if (key.includes(`_`)) {
    const [field, operator] = key.split(`_`);

    return {
      field,
      operator,
      value
    };
  }

  return {
    field: key,
    operator: `eq`,
    value
  };
};

const convertFilters = (filters) => {
  const result = {};

  Object.keys(filters).forEach((key) => {
    const value = filters[key];
    result[key] = convertFilter(key, value);
  });

  return result;
}

module.exports = {
  convertFilters,
  convertFilter
};
