var Model = require('../model');

var Service = module.exports = new Model.Builder('Service', {
  name: Model.DataTypes.STRING,
  description: Model.DataTypes.TEXT,
});
