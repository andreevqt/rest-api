const init = require(`./App`);

(async () => {
  try {
    await init();
  } catch (err) {
    console.log(err);
  } finally {
    await app.destroy();
  }
})();


