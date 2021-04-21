'use strict';

// const config = require(`../../../config`);
const bookshelf = require(`./bookshelf`);
const {mountModels} = require(`./bookshelf/mountModels`);
const {coreStoreModel} = require(`../utils/coreStore`);
const _ = require(`lodash`);

class DatabaseManager {
  constructor(app) {
    this.app = app;
    this.initialized = false;
  }

  async connect() {
    if (this.initialized) {
      console.log(`DatabaseManager has initialized already`);
      return;
    }

    const {config: {db: {client}}} = this.app;
    

    if ([`pg`, `mysql`, `sqlite`].includes(client)) {
      this.connector = bookshelf;

      const knex = await bookshelf.connection.connect();
      this.orm = bookshelf.orm(knex);

      this.models = {};
      await mountModels();

      this.initialized = true;
    }

    return this;
  }

  close() {
    this.connector.connection.close();
  }

  findEntity(entity) {
    return _.find(
      this.models,
      (_o, key) => key === entity
    );
  }

  query(entity) {
    const model = this.findEntity(entity);
    return this.connector.queries({model, app: this.app});
  }
}

const createDatabaseManager = (app) => {
  return new DatabaseManager(app);
}

module.exports = {
  createDatabaseManager
};
