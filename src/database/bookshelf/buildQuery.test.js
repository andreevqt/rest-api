'use strict';

const {buildWhereClause} = require(`./buildQuery`);
const sinon = require(`sinon`);

const mockQb = () => {
  return {
    where: sinon.stub(),
    whereIn: sinon.stub(),
    whereNotIn: sinon.stub(),
    whereRaw: sinon.stub(),
    whereNull: sinon.stub(),
    whereNotNull: sinon.stub(),
  }
};

let qb;

beforeEach(() => {
  qb = mockQb();
})

afterEach(() => {
  sinon.restore();
})

describe(`buildWhereClause`, () => {
  /* test(`Should throw if wrong clause`, () => {
    const field = {qb, field: 'age', operator: 'asdsd', value: '123'};
    expect(buildWhereClause(field)).toThrowError(Error);
  }); */

  test(`Should handle eq properly`, () => {
    const field = {qb, field: 'title', operator: 'eq', value: 'Hello world'};
    buildWhereClause(field);

    expect(qb.where.withArgs(field.field, field.value).calledOnce).toBe(true);
  });

  test(`Should handle ne properly`, () => {
    const field = {qb, field: 'age', operator: 'ne', value: '21'};
    buildWhereClause(field);

    expect(qb.where.withArgs(field.field, '!=', field.value).calledOnce).toBe(true);
  });

  test(`Should handle lt properly`, () => {
    const field = {qb, field: 'age', operator: 'lt', value: '21'};
    buildWhereClause(field);
    expect(qb.where.withArgs(field.field, '<', field.value).calledOnce).toBe(true);
  });

  test(`Should handle lte properly`, () => {
    const field = {qb, field: 'age', operator: 'lte', value: '21'};
    buildWhereClause(field);
    expect(qb.where.withArgs(field.field, '<=', field.value).calledOnce).toBe(true);
  });

  test(`Should handle gt properly`, () => {
    const field = {qb, field: 'age', operator: 'gt', value: '21'};
    buildWhereClause(field);
    expect(qb.where.withArgs(field.field, '>', field.value).calledOnce).toBe(true);
  });

  test(`Should handle gte properly`, () => {
    const field = {qb, field: 'age', operator: 'gte', value: '21'};
    buildWhereClause(field);
    expect(qb.where.withArgs(field.field, '>=', field.value).calledOnce).toBe(true);
  });

  test(`Should handle in properly`, () => {
    const field = {qb, field: 'age', operator: 'in', value: [12, 24]};
    buildWhereClause(field);
    expect(qb.whereIn.withArgs(field.field, field.value).calledOnce).toBe(true);
  });

  test(`Should handle nin properly`, () => {
    const field = {qb, field: 'age', operator: 'nin', value: [12, 24]};
    buildWhereClause(field);
    expect(qb.whereNotIn.withArgs(field.field, field.value).calledOnce).toBe(true);
  });

  test(`Should handle contains properly`, () => {
    const field = {qb, field: 'name', operator: 'contains', value: 'John'};
    buildWhereClause(field);
    expect(qb.whereRaw.withArgs(`LOWER(??) LIKE LOWER(?)`, [field.field, `%${field.value}%`]).calledOnce).toBe(true);
  });

  test(`Should handle null`, () => {
    const field = {qb, field: 'name', operator: 'null', value: 'John'};
    buildWhereClause(field);
    expect(qb.whereNull.withArgs(field.field).calledOnce).toBe(true);
  });
});
