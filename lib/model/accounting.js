var Store = require('./store');
var Util = require('util');
var Accounting = module.exports = {};

/**
 * A User. Map a federated account to local authorizations.
 */
var User = Accounting.User = function(id) {
  Store.Entity.call(this, Store.join('/users', id));

  this.created = new Date();
  this.profile = {};
  this.authorizations = [];
  this.groups = [];
};
Util.inherits(User, Store.Entity);

/**
 * An Authorization
 */
var Authorization = Accounting.Authorization = function(id) {
  Store.Entity.call(this, Store.join('/authorizations', id));
};
Util.inherits(Authorization, Store.Entity);
