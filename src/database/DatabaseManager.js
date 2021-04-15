'use strict';

const config = require(`../config`);
const bookshelf = require(`./bookshelf/bookshelf`);
const {mountModels} = require(`./mountModels`);

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

    const {client} = config.db;

    if ([`pg`, `mysql`, `sqlite`].includes(client)) {
      this.orm = await bookshelf.connect();
      this.models = await mountModels(this.app.modelsPath, this.orm);
      console.log(this.models);
      this.initialized = true;
    }

    return this;
  }

  close() {
    this.orm.close();
  }

  query(enitity) {
    return this.orm.query(enitity)
  }
}

const createDatabaseManager = (app) => {
  return new DatabaseManager(app);
}

module.exports = {
  createDatabaseManager
};
