'use strict';

const {convertFilter} = require(`./convertFilters`);

const fixtures = [
  {provided: {key: `name_contains`, value: `John`}, expected: {field: `name`, operator: `contains`, value: `John`}},
  {provided: {key: `age_in`, value: [1, 2, 3]}, expected: {field: `age`, operator: `in`, value: [1, 2, 3]}},
  {provided: {key: `age_nin`, value: [1, 2, 3]}, expected: {field: `age`, operator: `nin`, value: [1, 2, 3]}},
  {provided: {key: `age_gt`, value: 12}, expected: {field: `age`, operator: `gt`, value: 12}},
  {provided: {key: `age_gte`, value: 12}, expected: {field: `age`, operator: `gte`, value: 12}},
  {provided: {key: `age_lt`, value: 12}, expected: {field: `age`, operator: `lt`, value: 12}},
  {provided: {key: `age_lte`, value: 12}, expected: {field: `age`, operator: `lte`, value: 12}},
  {provided: {key: `age_ne`, value: 12}, expected: {field: `age`, operator: `ne`, value: 12}},
  {provided: {key: `age_null`, value: 12}, expected: {field: `age`, operator: `null`, value: 12}},
];

describe(`convertFilter`, () => {
  test(`Should convert implicit eq filter`, () => {
    const result = convertFilter('name', 'John');
    expect(result).toMatchObject({
      field: `name`,
      operator: `eq`,
      value: `John`
    });
  });

  test(`Should convert explicit eq filter`, () => {
    const result = convertFilter('name_eq', 'John');
    expect(result).toMatchObject({
      field: `name`,
      operator: `eq`,
      value: `John`
    });
  });

  test(`Should convert other operators`, () => {
    fixtures.forEach(({provided, expected}) => {
      const result = convertFilter(provided.key, provided.value);
      expect(result).toMatchObject({
        field: expected.field,
        operator: expected.operator,
        value: expected.value
      });
    })
  });
});
