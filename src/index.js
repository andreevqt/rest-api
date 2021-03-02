const init = require(`./App`);

(async () => {
  await init();
  await app.destroy();
})();


