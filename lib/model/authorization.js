var Model = require('../model');

var Statement = Model.requires('statement');
var Authorization = module.exports = new Model.Builder('Authorization', {
  name: Model.DataTypes.STRING,
  description: Model.DataTypes.TEXT,
});

Authorization.hasMany(Statement);
Statement.belongsTo(Authorization);
