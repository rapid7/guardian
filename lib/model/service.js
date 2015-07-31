var Model = require('../model');

var Service = module.exports = new Model.Builder('Service', {
  uri: Model.DataTypes.STRING(1024),
});
