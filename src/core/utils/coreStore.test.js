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
  key: `_testKey`,
};

const data = {
  key: `testKey`,
  value: `testValue`,
};

afterEach(() => {
  sinon.restore();
});

describe(`coreStore`, () => {
  test(`Set key in empty store`, async () => {
    const db = {
      query: sinon.stub().returns({
        find: sinon.stub().resolves(),
        findOne: sinon.stub().resolves(),
        create: sinon.stub().resolves(),
        update: sinon.stub().resolves(),
        delete: sinon.stub().resolves()
      })
    }; 

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
    const db = {
      query: sinon.stub().returns({
        find: sinon.stub(),
        findOne: sinon.stub().resolves(queryRes),
        create: sinon.stub().resolves(),
        update: sinon.stub().resolves(queryRes),
        delete: sinon.stub().resolves()
      })
    }; 

    const coreStore = createCoreStore({
      db
    });

    await coreStore.set(data);
    expect(db.query.calledTwice).toBe(true);
    expect(db.query().findOne.withArgs(where).calledOnce).toBe(true);
    expect(db.query().update.withArgs({
      id: queryRes.id,
    }, {
      ...queryRes,
      value: JSON.stringify(data.value)
    }).calledOnce).toBe(true);
  });

  test(`delete key from empty store`, async () => {
    const db = {
      query: sinon.stub().returns({
        find: sinon.stub(),
        findOne: sinon.stub().resolves(),
        create: sinon.stub().resolves(queryRes),
        update: sinon.stub().resolves(queryRes),
        delete: sinon.stub().resolves()
      })
    };

    const coreStore = createCoreStore({
      db
    });

    await coreStore.delete(data);
    expect(db.query.calledOnce).toBe(true);
    expect(db.query().delete.withArgs(where).calledOnce).toBe(true);
  });

  test(`delete key from not empty store`, async () => {
    const db = {
      query: sinon.stub().returns({
        find: sinon.stub(),
        findOne: sinon.stub().resolves(queryRes),
        create: sinon.stub().resolves(queryRes),
        update: sinon.stub().resolves(queryRes),
        delete: sinon.stub().resolves()
      })
    };

    const coreStore = createCoreStore({
      db
    });

    await coreStore.delete(data);
    expect(db.query.calledOnce).toBe(true);
    expect(db.query().delete.withArgs(where).calledOnce).toBe(true);
  });
});
