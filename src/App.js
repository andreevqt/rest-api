'use strict';

const fs = require(`fs`).promises;
const _ = require(`lodash`);
const path = require(`path`);
const config = require(`./config`);
const bookshelf = require(`./database/bookshelf/bookshelf`);
const {createDatabaseManager} = require(`./database/DatabaseManager`);

class App {

  /**
   * Initialize the application
   * 
   */
  async load() {
    this.dir = process.cwd();
    this.modelsPath = `${this.dir}/src/models`;
    this.db = createDatabaseManager(this);

    await this.db.connect();
  }

  query(entity) {
    return this.db.query(entity);
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
  // await app.load();

  global.app = app;

  return app;
};
