var Model = require('../model');

var Service = Model.requires('service');
var Action = module.exports = new Model.Builder('Action', {
  name: Model.DataTypes.STRING,
  description: Model.DataTypes.TEXT,
});

Action.belongsToMany(Service, {
  through: 'ActionServices',
});
Service.belongsToMany(Action, {
  through: 'ActionServices',
});
