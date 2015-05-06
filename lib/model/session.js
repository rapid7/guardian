var Store = require('./store');
var Util = require('util');
var UUID = require('libuuid');

/**
 * A Session
 */
var Session = module.exports = function(id) {
  Store.Entity.call(this, Store.join('/sessions', id || UUID.create()));
};
Store.extend('/sessions', Session);

Session.prototype.destroy = function(callback) {
  this.destroyed = true;
  this.del(callback);
};
