'use strict';

const config = require(`../../config`);
const {createDatabaseManager} = require(`./database/DatabaseManager`);
const {createCoreStore} = require(`./utils/coreStore`)
const logger = require(`./utils/logger`);

class App {

  constructor() {
    this.modelsPath = `${process.cwd()}/src/models`;
    this.log = logger;
  }

  /**
   * Initialize the application
   * 
   */
  async load() {
    this.config = config;
    this.db = createDatabaseManager(this);
    await this.db.connect();

    this.store = createCoreStore({db: this.db});
    this.log.info(`App has been loaded`);
  }

  /**
   * Build query
   * @param {string} entity
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

    this.log.info(`App has been destroyed`);
    return result;
  }
}

module.exports = () => {
  const app = new App();

  global.app = app;

  return app;
};
