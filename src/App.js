'use strict';

const fs = require(`fs`).promises;
const _ = require(`lodash`);
const path = require(`path`);
const config = require(`./config`);
const bookshelf = require(`./database/bookshelf`);
const {createDatabaseManager} = require(`./database/DatabaseManager`);

class App {

  constructor() {
    this.modelsPath = `${process.cwd()}/src/models`;
  }

  /**
   * Initialize the application
   * 
   */
  async load() {
    this.db = createDatabaseManager(this);
    this.config = config;

    await this.db.connect();
  }

  /**
   * Build query
   * 
   */
  query(entity) {
    return this.db.query(entity);
  }

  /**
   * Set models path
   * @param {string} path - new path
   */
  setModelsPath(path) {
    this.modelsPath = path;
  }

  /**
   * Destroy the app
   * 
   * @returns {undefined}
   */
  async destroy() {
    return this.db.close();
  }
}

module.exports = () => {
  const app = new App();

  global.app = app;

  return app;
};
