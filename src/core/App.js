'use strict';

const config = require(`../../config`);
const {createDatabaseManager} = require(`./database/DatabaseManager`);
const {createCoreStore, coreStoreModel} = require(`./utils/coreStore`)
const logger = require(`./utils/logger`);
const loadModules = require(`./load/loadModules`);
const bootstrap = require("./load/bootstrap");

class App {

  constructor(opts = {}) {
    this.dir = opts.dir || `${process.cwd()}/src`;
    this.loadModules = opts.loadModules || true;
    this.log = logger;
    this.models = new Map();
    this.connection = {};
    this.config = config;
  }

  /**
   * Initialize the application
   * 
   */
  async load() {
    // needed for tests
    if (loadModules) {
      const modules = await loadModules(app);
      this.api = modules.api;
    }

    bootstrap(this);

    this.models[`core_store`] = coreStoreModel;

    this.db = createDatabaseManager(this);
    await this.db.init();

    this.store = createCoreStore({db: this.db});
  }

  setApi(api) {
    this.api = api;
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

module.exports = (opts) => {
  const app = new App(opts);

  global.app = app;

  return app;
};
