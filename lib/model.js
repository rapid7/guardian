var Path = require('path');
var Sequelize = require('sequelize');

var Builder = exports.Builder = function(name, model) {
  this.model = connection.define(name, model);
  this.associations = [];

  builders[name] = this;
};

/**
 * Wrap model association methods
 */
['belongsTo', 'hasOne', 'hasMany', 'belongsToMany'].forEach(function(type) {
  Builder.prototype[type] = function(target, params) {
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
Builder.prototype.associate = function() {
  var _this = this;

  this.associations.forEach(function(assoc) {
    _this.model[assoc.type](assoc.target.model, assoc.params);
  });
};

exports.DataTypes = require('sequelize/lib/data-types');

var context = exports._context = {};
var builders = context.models = {};
var connection = context.connection =
  new Sequelize(Config.get('database:name'),
                Config.get('database:user'),
                Config.get('database:password'),
                Config.get('database:options'));

exports.requires = function(path) {
  return require(Path.join(__dirname, 'model', path));
};

exports.load = function(path) {
  return this.requires(path).model;
};

exports.sync = function(options) {
  options = options || {};

  // After the required model-set is loaded, generate associations
  Object.keys(builders).forEach(function(name) {
    builders[name].associate();
  });

  return connection.sync(options);
};

exports.close = function() {
  connection.close();
};
