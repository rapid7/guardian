var Model = require('../model');

var Service = Model.requires('service');
var Route = module.exports = new Model.Builder('Route', {
  path: Model.DataTypes.STRING(1024),
});

Route.belongsTo(Service);
Service.hasMany(Route);
