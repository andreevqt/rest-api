module.exports = {
  settings: {
    tableName: `posts`,
    id: true
  },
  attributes: {
    title: {
      type: `string`,
      required: true,
    },
    content: {
      type: `text`
    }
  }
};
