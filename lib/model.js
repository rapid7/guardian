var Path = require('path');
var Sequelize = require('sequelize');

var Model = module.exports = function(name, model) {
  this.entity = connection.define(name, model);
  this.associations = [];

  models[name] = this;
};

/**
 * Wrap model association methods
 */
['belongsTo', 'hasOne', 'hasMany', 'belongsToMany'].forEach(function(type) {
  Model.prototype[type] = function(target, params) {
    this.associations.push({
      type: type,
      target: target,
      params: params || {},
    });
  };
});

/**
 * Apply associations after all required models are loaded
 */
Model.prototype.associate = function() {
  var _this = this;

  this.associations.forEach(function(assoc) {
    _this.entity[assoc.type](assoc.target.entity, assoc.params);
  });
};

Model.DataTypes = require('sequelize/lib/data-types');

var context = Model._context = {};
var models = context.models = {};
var connection = context.connection =
  new Sequelize(Config.get('database:name'),
                Config.get('database:user'),
                Config.get('database:password'),
                Config.get('database:options'));

Model.load = function(path) {
  return require(Path.join(__dirname, 'model', path));
};

Model.requires = Model.load;

Model.sync = function(options) {
  options = options || {};

  // After the required model-set is loaded, generate associations
  Object.keys(models).forEach(function(name) {
    models[name].associate();
  });

  return connection.sync(options);
};

Model.close = function() {
  connection.close();
};
