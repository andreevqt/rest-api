'use strict';

const config = require(`../../../../config`);
const pluralize = require(`pluralize`);
const queries = require(`./queries`);
const _ = require(`lodash`);
const connection = require(`./knex`);
const schemaBuilder = require(`./schemaBuilder`);
const {mountModels} = require(`./mountModels`);
const bookshelf = require(`bookshelf`);

const orm = (connection) => {
  return new bookshelf(connection);
}

module.exports = {
  connection,
  schemaBuilder,
  queries,
  mountModels,
  orm
};

