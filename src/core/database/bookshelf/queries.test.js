'use strict';

const app = require(`../../App`)();
const postsData = require(`../../tests/fixtures/data/posts`);

beforeAll(async () => {
  app.setModelsPath(`${process.cwd()}/src/core/tests/fixtures/models`);
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
    const attrs = {
      title: `Test title`,
      content: `Test content`
    };

    const post = await app.query(`post`)
      .create(attrs);

    expect(post.title).toBe(attrs.title);
    expect(post.content).toBe(attrs.content);
  });
});

describe(`update`, () => {
  test(`Should update a model`, async () => {
    const created = await app.query(`post`)
      .create({title: `test`});
    const updated = await app.query(`post`)
      .update({id: created.id}, {title: `hello`});

    expect(updated.title).toBe(`hello`);

  });
});

describe(`delete`, () => {
  test(`Should delete a model`, async () => {
    const created = await app.query(`post`)
      .create({title: `test`});

    console.log(`here ${created.id}`);
    const deleted = await app.query(`post`)
      .delete(created.id);
    expect(deleted.id).toBe(created.id);

    const post = await app.query(`post`).findOne({id: created.id});
    expect(post).toBe(null);
  });

  test(`Should throw if wrong id`, async () => {
    try {
      await app.query(`post`).delete(666);
    } catch (e) {
      expect(e.message).toBe(`entry.notFound`);
    }
  });
});

describe(`find`, () => {
  test(`Contains operator`, async () => {
    const posts = await app.query(`post`)
      .find({title_contains: `lorem`});
    expect(/lorem/i.test(posts[0].title)).toBe(true);
  });

  test(`multiple operators`, async () => {
    const [post] = await app.query(`post`)
      .find({title_contains: `lorem`, id: 1});

    expect(/lorem/i.test(post.title)).toBe(true);
    expect(post.id).toBe(1);
  });
});

describe(`findOne`, () => {
  test(`Should return one entry`, async () => {
    const post = await app.query(`post`)
      .findOne({title_contains: `lorem`});

    expect(/lorem/i.test(post.title)).toBe(true);
  });
})
