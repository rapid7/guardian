var Model = require('../model');

var Policy = Model.requires('policy');
var Group = module.exports = new Model.Builder('Group', {
  name: Model.DataTypes.STRING,
});

Group.belongsToMany(Policy, { through: 'GroupPolicies' });
Policy.belongsToMany(Group, { through: 'GroupPolicies' });
