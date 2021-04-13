const fs = require(`fs`).promises;
const _ = require(`lodash`);
const path = require(`path`);
const config = require(`./config`);
const bookshelf = require(`./connectors/bookshelf`);

class App {

  /**
   * Initialize the application
   * 
   * @return {undefined}
   */
  async load() {
    this.dir = process.cwd();
    this.connector = await this.createConnector(config.db.client);

    await this.loadModels();
  }

  /**
   * Close database connection
   * 
   * @returns {undefined}
   */
  async destroy() {
    return this.connector.close();
  }

  /**
   * 
   * @param {*} client 
   * @returns 
   */
  async createConnector(client) {
    if ([`pg`, `mysql`, `sqlite`].includes(client)) {
      await bookshelf.connect();
      return bookshelf;
    }
  }

  async loadModels() {
    const modelsPath = `${this.dir}/src/models`;

    const files = await fs.readdir(modelsPath);
    this.models = await files.reduce(async (res, file) => {
      let model = {};

      const name = path.parse(file).name;
      model.name = name;
      model.path = `${modelsPath}/${file}`;
      model.definition = require(model.path);
      model.internal = await this.connector.createOrUpdateTable(model);

      return Promise.resolve({...res, [name]: model});
    }, Promise.resolve({}));
  }
}

module.exports = async () => {
  const app = new App();
  await app.load();
  global.app = app;
};
