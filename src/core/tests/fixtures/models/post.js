module.exports = {
  settings: {
    id: true
  },
  attributes: {
    title: {
      type: `string`,
      required: true,
    },
    content: {
      type: `text`
    }, 
    author: {
      type: `hasOne`
    }
  }
};
