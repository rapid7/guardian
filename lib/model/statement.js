var Model = require('../model');

var Action = Model.requires('action');
var Instance = Model.requires('instance');
var Statement = module.exports = new Model.Builder('Statement', {
  effect: {
    type: Model.DataTypes.ENUM('Allow', 'Deny'),
    defaultValue: 'Allow',
  },
});

Statement.belongsToMany(Action, {
  through: 'StatementActions',
});
Action.belongsToMany(Statement, {
  through: 'StatementActions',
});

Statement.belongsToMany(Instance, {
  as: 'Resource',
  through: 'StatemantResources',
});

Instance.belongsToMany(Statement, {
  through: 'StatemantResources',
});
