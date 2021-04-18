'use strict';

const coreStoreModel = {
  settings: {
    id: true,
    tableName: `core-store`
  },
  attributes: {
    key: {
      type: `string`,
    },
    value: {
      type: `string`
    },
    type: {
      type: `string`
    }
  }
}
module.exports = {
  coreStoreModel
};
