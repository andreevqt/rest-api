'use strict';

const config = require(`../../../../config`);
const pluralize = require(`pluralize`);
const bookshelf = require(`bookshelf`);
const queries = require(`./queries`);
const _ = require(`lodash`);

let knex;

const close = async () => {
  return knex.destroy();
};

const createOrUpdateTable = async ({name, definition}) => {
  const {settings: {tableName = pluralize(name), id}, attributes} = definition;

  const hasTable = await knex.schema.hasTable(tableName);

  const createId = (table) => {
    if (id) {
      table.increments(`id`).primary();
    }
  };

  const createTable = async (table) => {
    await knex.schema.createTable(table, (tbl) => {
      createId(tbl);
      createColumns(tbl, attributes);
    });
  };

  const buildColumn = (table, name, type) => {
    switch (type) {
      case `string`:
        return table.string(name);
      case `text`:
        return table.text(name, `longtext`);
      case `uuid`:
        return table.uuid(name);
      case `uid`:
        table.unique(name);
        return table.string(name);
      case `integer`:
        return table.integer(name);
      case `boolean`:
        return table.boolean(name);
      case `decimal`:
        return table.decimal(name);
      case `test`:
        return

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

const internal = ({orm, tableName, name}) => {
  return bookshelf(orm.knex).model(
    _.capitalize(name), {
    tableName
  }
  );
};

module.exports.connect = async () => {
  if (process.env.NODE_ENV === `test`) {
    knex = require('knex')({
      client: `sqlite3`,
      connection: {
        filename: `:memory:`
      },
      debug: config.debug,
      useNullAsDefault: true
    });
  } else {
    knex = require('knex')({
      debug: config.debug,
      client: config.db.client,
      connection: config.db
    });
  }

  return {
    knex,
    createOrUpdateTable,
    internal,
    queries,
    close
  };
};
