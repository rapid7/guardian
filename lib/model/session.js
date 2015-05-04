var Store = require('./store');
var Util = require('util');
var UUID = require('libuuid');

/**
 * A Session
 */
var Session = module.exports = function(id) {
  this.__id = id || UUID.create();
  this.created = new Date();

  Store.Entity.call(this, Store.join('/sessions', this.__id));
};
Util.inherits(Session, Store.Entity);

Object.defineProperty(Session.prototype, 'id', {
  get: function() {
    return this.__id;
  }
});

Session.prototype.destroy = function(callback) {
  this.destroyed = true;
  this.del(callback);
};
