const fs = require(`fs`).promises;
const _ = require(`lodash`);
const path = require(`path`);
const config = require(`./config`);
const bookshelf = require(`./orm/bookshelf`);

class App {

  /**
   * 
   * Initialize the application
   * 
   */
  async load() {
    this.dir = process.cwd();
    this.orm = await this.createOrm(config.db.client);
    await this.loadModels();
  }

  /**
   * Close database connection
   * 
   * @returns {undefined}
   */
  async destroy() {
    return this.orm.close();
  }

  /**
   * 
   * @param {*} client 
   * 
   */
  async createOrm(client) {
    if ([`pg`, `mysql`, `sqlite`].includes(client)) {
      return bookshelf.connect();
    }
  }

  async loadModels() {
    const modelsPath = `${this.dir}/src/models`;

    const files = await fs.readdir(modelsPath);
    this.models = await files.reduce(async (res, file) => {
      let properties = {};

      const name = path.parse(file).name;
      properties.name = name;
      properties.path = `${modelsPath}/${file}`;
      properties.definition = require(properties.path);
      properties.orm = this.orm;
      properties.internal = await this.orm.createOrUpdateTable(properties);

      return Promise.resolve({...res, [name]: properties});
    }, Promise.resolve({}));
  }
}

module.exports = async () => {
  const app = new App();
  await app.load();
  global.app = app;
};
