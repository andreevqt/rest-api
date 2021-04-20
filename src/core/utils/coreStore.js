'use strict';

const coreStoreModel = {
  settings: {
    id: true,
    tableName: `core_store`
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
};

const createCoreStore = ({db}) => {
  const get = async (params = {}) => {
    const {type, key, name} = params;

    const where = {
      key
    };

    const data = await db.query(`core-store`).findOne(where);

    if (!data) {
      return null;
    }

    if (
      data.type === `object` ||
      data.type === `array` ||
      data.type === `boolean` ||
      data.type === `string`
    ) {
      try {
        return JSON.parse(data.value);
      } catch (err) {
        return new Date(data.value);
      }
    } else if (data.type === `number`) {
      return parseFloat(data.value);
    } else {
      return null;
    }
  };

  const set = async (params = {}) => {
    const {type, key, value, name} = params;

    const prefix = `${type ? type : ''}${name ? `_${name}` : ``}`;

    const where = {
      key: `${prefix}_${key}`
    };

    const data = await db.query(`core-store`).findOne(where);
    if (data) {
      const newData = {
        ...data,
        value: JSON.stringify(value) || value.toString(),
        type: (typeof value).toString()
      };

      await db.query(`core-store`).update({id: newData.id}, newData);
    } else {
      const newData = {
        ...where,
        value: JSON.stringify(value) || value.toString(),
        type: (typeof value).toString()
      };

      await db.query(`core-store`).create(newData);
    }
  };

  const deleteFn = (params = {}) => {

  };

  return {
    get,
    set,
    delete: deleteFn
  };
};

module.exports = {
  coreStoreModel,
  createCoreStore
};
