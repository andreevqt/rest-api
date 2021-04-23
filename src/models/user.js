module.exports = {
  attributes: {
    name: {
      type: `string`
    }, 
    email: {
      type: `string`
    }, 
    article : {
      collection: `post`,
      via: `author`
    }
  }
};
