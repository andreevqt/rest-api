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

    this.models = new Map();
    this.queries = new Map();
  }

  async init() {
    if (this.initialized) {
      console.log(`DatabaseManager has initialized already`);
      return;
    }

    const {config: {db: {client}}} = this.app;

    this.initializeModelsMap();

    if ([`pg`, `mysql`, `sqlite`].includes(client)) {
      this.connector = bookshelf(app);
      await this.connector.initialize();
      this.initialized = true;
    }

    return this;
  }

  initializeModelsMap() {
    Object.keys(this.app.models).forEach((modelKey) => {
      const model = this.app.models[modelKey];
      this.models.set(model.uid, model);
    });
  }

  getModelFromApp(name) {
    const key = _.toLower(name);
    return _.get(this.app, ['models', key]);
  }

  getModel(name) {
    const key = _.toLower(name);

    if (this.models.has(key)) {
      const {modelName} = this.models.get(key);
      return this.getModelFromApp(modelName);
    } else {
      return this.getModelFromApp(key);
    }
  }

  close() {
    this.connector.close()
  }

  query(entity) {
    const model = this.getModel(entity);
    return this.connector.queries({model, app: this.app});
  }
}

const createDatabaseManager = (app) => {
  return new DatabaseManager(app);
}

module.exports = {
  createDatabaseManager
};
