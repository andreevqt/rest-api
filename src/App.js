'use strict';

const fs = require(`fs`).promises;
const _ = require(`lodash`);
const path = require(`path`);
const config = require(`./config`);
const bookshelf = require(`./database/bookshelf`);
const {createDatabaseManager} = require(`./database/DatabaseManager`);
const {logger} = require(`./utils`);

class App {

  constructor() {
    this.modelsPath = `${process.cwd()}/src/models`;
    this.logger = logger;
  }

  /**
   * Initialize the application
   * 
   */
  async load() {
    this.db = createDatabaseManager(this);
    this.config = config;
    await this.db.connect();
    this.logger.info(`App has been loaded`);
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
    const result = await this.db.close();

    this.logger.info(`App has been destroyed`);
    return result;
  }
}

module.exports = () => {
  const app = new App();

  global.app = app;

  return app;
};
