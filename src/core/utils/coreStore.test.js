'use strict';

const sinon = require(`sinon`);
const {createCoreStore} = require(`./coreStore`)

const queryRes = {
  id: 1,
  key: 'testKey',
  value: 'testValue',
  type: 'string',
};


const where = {
  key: `testKey`,
};

const data = {
  key: `testKey`,
  value: `testValue`,
};

const db = {
  query: sinon.stub().returns({
    find: sinon.stub(),
    findOne: sinon.stub().resolves(queryRes),
    create: sinon.stub(),
    update: sinon.stub(),
    delete: sinon.stub()
  })
};

afterEach(() => {
  sinon.restore();
});

describe(`coreStore`, () => {
  test(`Set key in empty store`, async () => {
    const coreStore = createCoreStore({
      db
    });

    await coreStore.set(data);
    expect(db.query.calledTwice).toBe(true);
    expect(db.query().findOne.withArgs(where).calledOnce).toBe(true);
    expect(db.query().create.withArgs({
      ...where,
      value: JSON.stringify(data.value),
      type: `string`
    }).calledOnce).toBe(true);
  });

  test(`Set key in not empty store`, async () => {
    const coreStore = createCoreStore({
      db
    });

    await coreStore.set(data);
    expect(db.query.calledTwice).toBe(true);
    expect(db.query().findOne.withArgs(where).calledOnce).toBe(true);
    expect(db.query().create.withArgs({
      ...where,
      value: JSON.stringify(data.value),
      type: `string`
    }).calledOnce).toBe(true);
  });
});
