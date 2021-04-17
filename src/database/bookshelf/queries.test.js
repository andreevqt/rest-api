'use strict';

const app = require(`../../App`)();
const postsData = require(`../../tests/fixtures/data/posts`);

beforeAll(async () => {
  app.setModelsPath(`${process.cwd()}/src/tests/fixtures/models`);
  await app.load();
  postsData.forEach(async (data) => {
    await app.query(`post`).create(data);    
  })
});

afterAll(async () => {
  await app.destroy();
});

describe(`create`, () => {
  test(`Should create a model`, async () => {
    const attributes = {
      title: `Test title`,
      content: `Test content`
    };

    const post = await app.query(`post`)
      .create(attributes);

    expect(post.title).toBe(attributes.title);
    expect(post.content).toBe(attributes.content);
  });
});

describe(`find`, () => {
  test(`Contains operator`, async () => {
    const posts = await app.query(`post`)
      .find({title_contains: `lorem`});
    expect(/lorem/i.test(posts[0].title)).toBe(true);
  });
});
