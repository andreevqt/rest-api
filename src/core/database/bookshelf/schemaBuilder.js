'use strict';

const createOrUpdateTable = async ({definition, orm: {knex}}) => {
  const {settings: {tableName, id}, attributes} = definition;

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

const runMigrations = async ({definition, orm}) => {
  await createOrUpdateTable({definition, orm});
};

module.exports = {
  createOrUpdateTable,
  runMigrations
};
