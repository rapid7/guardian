var Model = require('../model');

var Provider = module.exports = new Model.Builder('Provider', {
  name: Model.DataTypes.STRING,
  identity: Model.DataTypes.STRING,
});
