var Model = require('../model');

var Group = Model.requires('group');
var Policy = Model.requires('policy');
var Provider = Model.requires('provider');

var User = module.exports = new Model.Builder('User', {
  name: Model.DataTypes.STRING,
  profile: Model.DataTypes.TEXT,
});

Group.belongsToMany(User, { through: 'UserGroups' });
User.belongsToMany(Group, { through: 'UserGroups' });

User.belongsToMany(Policy, { through: 'UserPolicies' });
Policy.belongsToMany(User, { through: 'UserPolicies' });

User.hasMany(Provider);
Provider.belongsTo(User);
