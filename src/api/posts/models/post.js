module.exports = {
  attributes: {
    title: {
      type: `string`
    },
    content: {
      type: `text`
    },
    author: {
      model: `user`
    }
  }
};
