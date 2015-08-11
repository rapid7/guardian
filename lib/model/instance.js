var Model = require('../model');

var Service = Model.requires('service');
var Instance = module.exports = new Model.Builder('Instance', {
  name: Model.DataTypes.STRING,
  uri: Model.DataTypes.STRING(1024),
  description: Model.DataTypes.TEXT,
});

Instance.belongsTo(Service);
Service.hasMany(Instance);
