var Store = require('./store');
var Accounting = module.exports = {};

function base64_encode(string) {
  return (new Buffer(string, 'utf8'))
    .toString('base64')
    .replace(/\//g, '_')
    .replace(/\+/g, '-');
}

function byName(name) {
  var entity = new this(base64_encode(name));
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
