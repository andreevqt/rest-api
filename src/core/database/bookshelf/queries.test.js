'use strict';

const app = require(`../../App`)({loadModules: false});

const api = {
  posts: {
    models: {
      post: {
        attributes: {
          title: {
            type: `string`,
            required: true,
          },
          content: {
            type: `text`
          },
          author: {
            model: `user`
          }
        }
      }
    }
  }, 
  users: {
    models: {
      user: {
        attributes: {
          name: {
            type: `string`
          },
          email: {
            type: `string`
          }, 
          posts: {
            collection: `post`,
            via: `posts`
          }
        }
      }
    }
  }
};

const fixtures = {
  posts: [
    {
      title: `Lorem ipsum dolor sit amet`,
      content: `Integer eget magna fringilla, scelerisque enim ut, convallis sapien. Sed vitae elit tellus. Interdum et malesuada fames ac ante ipsum primis in faucibus.`
    }, {
      title: `In orci ex, vulputate sit`,
      content: `Integer eget magna fringilla, scelerisque enim ut, convallis sapien. Sed vitae elit tellus. Interdum et malesuada fames ac ante ipsum primis in faucibus.`
    }, {
      title: `Maecenas tristique molestie ligula`,
      content: `Integer eget magna fringilla, scelerisque enim ut, convallis sapien. Sed vitae elit tellus. Interdum et malesuada fames ac ante ipsum primis in faucibus.`
    }, {
      title: `Vestibulum malesuada orci quam`,
      content: `Integer eget magna fringilla, scelerisque enim ut, convallis sapien. Sed vitae elit tellus. Interdum et malesuada fames ac ante ipsum primis in faucibus.`
    }, {
      title: `Class aptent taciti sociosqu ad litora`,
      content: `Integer eget magna fringilla, scelerisque enim ut, convallis sapien. Sed vitae elit tellus. Interdum et malesuada fames ac ante ipsum primis in faucibus.`
    },
  ]
};

beforeAll(async () => {
  app.setApi(api)

  await app.load();
  const posts = fixtures.posts;

  for (let i = 0; i < posts.length; i++) {
    const post = posts[i];
    await app.query(`post`).create(post);
  }
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

/* describe(`populate`, () => {
  test(`Should populate relation`, async () => {
    const post = await app.query(`post`)
      .findOne({title_contains: `lorem`});

    expect(/lorem/i.test(post.title)).toBe(true);
  });
})
 */
