var Model = require('../model');

var Authorization = Model.requires('authorization');
var User = Model.requires('user');

var Group = module.exports = new Model('Group', {
  name: Model.DataTypes.STRING,
});

Group.belongsToMany(Authorization, { through: 'GroupAuthorization' });
Authorization.belongsToMany(Group, { through: 'GroupAuthorization' });

Group.belongsToMany(User, { through: 'UserGroups' });
User.belongsToMany(Group, { through: 'UserGroups' });
