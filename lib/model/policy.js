var Model = require('../model');

var Statement = Model.requires('statement');

var Policy = module.exports = new Model.Builder('Policy', {
  name: Model.DataTypes.STRING,
  description: Model.DataTypes.TEXT,
});

Statement.belongsTo(Policy);
Policy.hasMany(Statement);
