var Store = require('./store');
var Accounting = module.exports = {};

function id_encode(string) {
  return (new Buffer(string, 'utf8')).toString('hex');
}

function id_decode(string) {
  return  (new Buffer(string, 'hex')).toString('utf8');
}

function byName(name) {
  var entity = new this(id_encode(name));
  entity.name = name;

  return entity;
}

/**
 * A User. Map federated accounts to authorizations.
 */
var User = Accounting.User = function(id) {
  Store.Entity.call(this, Store.join('/users', id));

  this.name = '';
  this.profile = {};
  this.providers = {};
  this.authorizations = [];
  this.groups = [];
};
Store.extend('/users', User);
User.byName = byName;

User.prototype.getAuthorizations = function(callback) {
  Authorization.list(this.authorizations, callback);
};

/**
 * An Authorization
 */
var Authorization = Accounting.Authorization = function(id) {
  Store.Entity.call(this, Store.join('/authorizations', id));

  this.name = '';
  this.description = '';
  this.statements = [];
};
Store.extend('/authorizations', Authorization);
Authorization.byName = byName;

var Group = Accounting.Group = function(id) {
  Store.Entity.call(this, Store.join('/groups', id));

  this.name = '';
  this.description = '';
  this.authorizations = [];
};
Store.extend('/groups', Group);
Group.byName = byName;
