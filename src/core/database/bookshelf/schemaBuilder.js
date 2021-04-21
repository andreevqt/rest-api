'use strict';

const _ = require(`lodash`);

const {getColumnsWhereDefinitionChanged} = require(`./coreStoreDefinition`);

const createOrUpdateTable = async ({definition, orm}) => {
  const {settings: {tableName, id}, attributes} = definition;

  const tableExists = await orm.knex.schema.hasTable(tableName);

  const createId = (table) => {
    if (id) {
      table.increments(`id`).primary();
    }
  };

  const uniqueColName = (table, key) => `${table}_${key}_unique`;

  const createTable = async (table, opts = {}) => {
    const {trx = orm.knex} = opts;
    await trx.schema.createTable(table, (tbl) => {
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
      default:
        return null;
    }
  };

  const alterColumns = (table, columns, opts = {}) => {
    return createColumns(table, columns, { ...opts, alter: true });
  };

  const createColumns = (table, columns, opts = {}) => {
    const {tableExists, alter = false} = opts;

    Object.keys(columns).forEach((key) => {
      const {required = false, type, unique} = columns[key];
      const col = buildColumn(table, key, type);
      if (!col) {
        return;
      }

      if (required) {
        col.notNullable();
      } else {
        col.nullable();
      }

      if (unique) {
        if (definition.client !== 'sqlite3' || !tableExists) {
          tbl.unique(key, uniqueColName(table, key));
        }
      }

      if (alter) {
        col.alter();
      }
    })
  };

  const getColumnInfo = async (columnName, tableName, orm) => {
    const exists = await orm.knex.schema.hasColumn(tableName, columnName);

    return {
      columnName,
      exists,
    };
  };

  const isColumn = ({ definition, attribute, name }) => {
    if (!_.has(attribute, 'type')) {
      const relation = definition.associations.find((association) => {
        return association.alias === name;
      });
  
      if (!relation) return false;
  
      if (['oneToOne', 'manyToOne', 'oneWay'].includes(relation.nature)) {
        return true;
      }
  
      return false;
    }
  
    if (['component', 'dynamiczone'].includes(attribute.type)) {
      return false;
    }
  
    return !_.has(attribute, 'type');
  };

  if (!tableExists) {
    await createTable(tableName);
    return;
  }

  const attributesNames = Object.keys(attributes);

  const columnsInfo = await Promise.all(
    attributesNames.map(attributeName => getColumnInfo(attributeName, tableName, orm))
  );

  const nameOfColumnsToAdd = columnsInfo.filter(info => !info.exists).map(info => info.columnName);

  const columnsToAdd = _.pick(attributes, nameOfColumnsToAdd);

  if (Object.keys(columnsToAdd).length > 0) {
    await orm.knex.schema.table(tableName, (tbl) => {
      createColumns(tbl, columnsToAdd, {tableExists});
    });
  }

  const attrsNameWithoutTimestamps = attributesNames.filter(
    columnName => !(definition.settings.timestamps || []).includes(columnName)
  );

  const columnsToAlter = await getColumnsWhereDefinitionChanged(
    attrsNameWithoutTimestamps,
    definition,
    orm
  );

  console.log(`here`);

  const shouldRebuild =
    columnsToAlter.length > 0 || definition.client === 'sqlite3';

  if (shouldRebuild) {
    switch (definition.client) {
      case 'sqlite3': {
        const tmpTable = `tmp_${tableName}`;

        const rebuildTable = async (trx) => {
          await trx.schema.renameTable(tableName, tmpTable);

          // drop possible conflicting indexes
          await Promise.all(
            attributesNames.map(key =>
              trx.raw('DROP INDEX IF EXISTS ??', uniqueColName(tableName, key))
            )
          );

          // create the table
          await createTable(tableName, {trx});

          const attrs = attributesNames.filter(attributeName =>
            isColumn({
              definition,
              attribute: attributes[attributeName],
              name: attributeName,
            })
          );

          const allAttrs = ['id', ...attrs];

          await trx.insert(qb => qb.select(allAttrs).from(tmpTable)).into(tableName);
          await trx.schema.dropTableIfExists(tmpTable);
        };

        try {
          await orm.knex.transaction((trx) => rebuildTable(trx));
        } catch (err) {
          if (err.message.includes('UNIQUE constraint failed')) {
            app.log.error(
              `Unique constraint fails, make sure to update your data and restart to apply the unique constraint.\n\t- ${err.stack}`
            );
          } else {
            app.log.error(`Migration failed`);
            app.log.error(err);
          }

          return false;
        }
        break;
      }
      default: {
        const alterTable = async (trx) => {
          await Promise.all(
            columnsToAlter.map(col => {
              return orm.knex.schema
                .alterTable(tableName, (tbl) => {
                  tbl.dropUnique(col, uniqueColName(tableName, col));
                })
                .catch(() => { });
            })
          );
          await trx.schema.alterTable(tableName, (tbl) => {
            alterColumns(tbl, _.pick(attributes, columnsToAlter), {
              tableExists,
            });
          });
        };

        try {
          await orm.knex.transaction((trx) => alterTable(trx));
        } catch (err) {
          if (err.code === '23505' && definition.client === 'pg') {
            app.log.error(
              `Unique constraint fails, make sure to update your data and restart to apply the unique constraint.\n\t- ${err.message}\n\t- ${err.detail}`
            );
          } else if (definition.client === 'mysql' && err.errno === 1062) {
            app.log.error(
              `Unique constraint fails, make sure to update your data and restart to apply the unique constraint.\n\t- ${err.sqlMessage}`
            );
          } else {
            app.log.error(`Migration failed`);
            app.log.error(err);
          }

          return false;
        }
      }
    }
  }
};

const runMigrations = async ({definition, orm}) => {
  await createOrUpdateTable({definition, orm});
};

module.exports = {
  runMigrations
};
