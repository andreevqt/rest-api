'use strict';

const config = require(`../config`);
const bookshelf = require(`bookshelf`);

let knex;

const close = async () => {
  return knex.destroy();
};

const createOrUpdateTable = async ({name, definition, orm}) => {
  const {settings: {tableName, id}, attributes} = definition;

  const hasTable = await orm.knex.schema.hasTable(tableName);

  const createId = (table) => {
    if (id) {
      table.increments(`id`).primary();
    }
  };

  const createTable = async (table) => {
    await orm.knex.schema.createTable(table, (tbl) => {
      createId(tbl);
      createColumns(tbl, attributes);
    });
  };

  const buildColumn = (table, name, type) => {
    switch (type) {
      case 'string':
        return table.string(name);
      case 'uuid':
        return table.uuid(name);
      case 'uid':
        table.unique(name);
        return table.string(name);
      case 'integer':
        return table.integer(name);
      case 'boolean': 
        return table.boolean(name);
      case 'decimal':
        return table.decimal(name);
      default:
        return null;
    }
  };

  const createColumns = (table, columns) => {
    Object.keys(columns).forEach((key) => {
      const {required = false, type} = columns[key];
      const col = buildColumn(table, key, type);
      if (!col) {
        return;
      }

      if (required) {
        col.notNullable();
      } else {
        col.nullable();
      }
    })
  };

  if (!hasTable) {
    await createTable(tableName);
  }
};

module.exports.connect = async () => {
  knex = require('knex')({
    debug: config.debug,
    client: config.db.client,
    connection: config.db
  });

  return {
    knex,
    createOrUpdateTable,
    close
  };
};
