const config = require(`../config`);
const bookshelf = require(`bookshelf`);

let knex;

module.exports.connect = async () => {
  knex = require('knex')({
    debug: config.debug,
    client: config.db.client,
    connection: config.db
  })
};

module.exports.close = async () => {
  return knex.destroy();
};


const createOrUpdateTable = (model) => {

}

module.exports.create = async (model) => {
  const shelf = bookshelf(knex);
  const {entity: {settings, attributes}} = model;

  const hasTable = await knex.schema.hasTable(settings.tableName);
  if (!hasTable) {
    await knex.schema.createTable(settings.tableName, (table) => {
      if (settings.id) {
        table.increments(`id`).primary();
      }

      // const attrs = Object.keys(attributes);

      for (const [key, attr] of Object.entries(attributes)) {
        const {type} = attr;
        const fn = table[type];
        fn(key);
      }

      // for (let i = 0; i < attrs.length; i++) {
      //   const attr = attrs[i];
      //   const {type} = attributes[attr];
      //   const fn = table[type];
      //   fn(attr);
      // }
    });

    console.log(`Table ${settings.tableName} has created`);
  }

  return shelf.model(settings.name, {
    tableName: settings.tableName
  });
};

