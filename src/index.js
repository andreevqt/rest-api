const app = require(`./App`)();

(async () => {
  try {
    await app.load();
  } catch (err) {
    console.log(err);
  } finally {
    await app.destroy();
  }
})();


