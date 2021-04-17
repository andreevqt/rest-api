'use strict';

const {buildWhereClause, buildQuery} = require(`./buildQuery`);
const sinon = require(`sinon`);

const qb = {
  where: sinon.stub(),
  whereIn: sinon.stub(),
  whereNotIn: sinon.stub(),
  whereRaw: sinon.stub(),
  whereNull: sinon.stub(),
  whereNotNull: sinon.stub(),
  offset: sinon.stub(),
  start: sinon.stub(),
  distinct: sinon.stub()
};

afterEach(() => {
  sinon.restore();
})

describe(`buildWhereClause`, () => {
  test(`Should handle eq properly`, () => {
    const options = {qb, field: 'title', operator: 'eq', value: 'Hello world'};
    buildWhereClause(options);
    expect(qb.where.withArgs(options.field, options.value).calledOnce).toBe(true);
  });

  test(`Should handle ne properly`, () => {
    const options = {qb, field: 'age', operator: 'ne', value: '21'};
    buildWhereClause(options);
    expect(qb.where.withArgs(options.field, '!=', options.value).calledOnce).toBe(true);
  });

  test(`Should handle lt properly`, () => {
    const options = {qb, field: 'age', operator: 'lt', value: '21'};
    buildWhereClause(options);
    expect(qb.where.withArgs(options.field, '<', options.value).calledOnce).toBe(true);
  });

  test(`Should handle lte properly`, () => {
    const options = {qb, field: 'age', operator: 'lte', value: '21'};
    buildWhereClause(options);
    expect(qb.where.withArgs(options.field, '<=', options.value).calledOnce).toBe(true);
  });

  test(`Should handle gt properly`, () => {
    const options = {qb, field: 'age', operator: 'gt', value: '21'};
    buildWhereClause(options);
    expect(qb.where.withArgs(options.field, '>', options.value).calledOnce).toBe(true);
  });

  test(`Should handle gte properly`, () => {
    const options = {qb, field: 'age', operator: 'gte', value: '21'};
    buildWhereClause(options);
    expect(qb.where.withArgs(options.field, '>=', options.value).calledOnce).toBe(true);
  });

  test(`Should handle in properly`, () => {
    const options = {qb, field: 'age', operator: 'in', value: [12, 24]};
    buildWhereClause(options);
    expect(qb.whereIn.withArgs(options.field, options.value).calledOnce).toBe(true);
  });

  test(`Should handle nin properly`, () => {
    const options = {qb, field: 'age', operator: 'nin', value: [12, 24]};
    buildWhereClause(options);
    expect(qb.whereNotIn.withArgs(options.field, options.value).calledOnce).toBe(true);
  });

  test(`Should handle contains properly`, () => {
    const options = {qb, field: 'name', operator: 'contains', value: 'John'};
    buildWhereClause(options);
    expect(qb.whereRaw.withArgs(`LOWER(??) LIKE LOWER(?)`, [options.field, `%${options.value}%`]).calledOnce).toBe(true);
  });

  test(`Should handle null`, () => {
    const options = {qb, field: 'name', operator: 'null', value: 'John'};
    buildWhereClause(options);
    expect(qb.whereNull.withArgs(options.field).calledOnce).toBe(true);
  });
});

describe(`buildQuery`, () => {
  test(`Where clause should be parsed properly`, () => {
    const options = {
      filters: {
        start: 1, limit: 10,
        where: {
          title: {field: `title`, operator: `eq`, value: `John Doe`},
          age: {field: `age`, operator: `in`, value: [18, 21]}
        }
      },
      qb
    };

    buildQuery(options)(qb);

    expect(qb.start.withArgs(options.filters.start).calledOnce).toBe(true);
    expect(qb.offset.withArgs(options.filters.limit).calledOnce).toBe(true);
    expect(qb.distinct.calledOnce).toBe(true);
    expect(qb.where.withArgs('title', 'John Doe').calledOnce).toBe(true);
    expect(qb.whereIn.withArgs('age', [18, 21]).calledOnce).toBe(true);
  });
});

