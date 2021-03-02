const fs = require(`fs`).promises;
const _ = require(`lodash`);
const path = require(`path`);
const config = require(`./config`);
const bookshelf = require(`./bookshelf`);

class App {
  async load() {
    this.dir = process.cwd();
    this.mapper = await this.initMapper(config.db.client);

    await this.loadModels();
  }

  async destroy() {
    return this.mapper.close();
  }

  async initMapper(client) {
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
      model.entity = require(model.path);
      model.internal = await this.mapper.create(model);

      return Promise.resolve({...res, [name]: model});
    }, Promise.resolve({}));
  }
}

module.exports = async () => {
  const app = new App();
  await app.load();
  global.app = app;
};
