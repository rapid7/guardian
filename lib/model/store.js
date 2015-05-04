var ETCD = require('etcdjs');
var Util = require('util');

var Store = module.exports = {};
Store.connect = function(store) {
  store = store || {};

  Store.client = new ETCD(store.host || 'http://localhost:2379', {
    refresh: !!store.refresh,
    timeout: store.timeout || 2500,
    json: true
  });
};
Store.join = require('path').join;

/**
 * Generic entity with CAS save/delete
 */
var Entity = function(path, client) {
  this.__client = client || Store.client;
  this.__path = path;
  this.__index = null;
  this.__expires = null;

  this.__ttl = null;
};
Store.Entity = Entity;

Object.defineProperty(Entity.prototype, 'isNew', {
  get: function() {
    return this.__index === null;
  }
});

Entity.prototype.get = function(callback) {
  var entity = this;
  this.__client.get(this.__path, function(err, res) {
    if (err) return callback(err);
    if (!res) return callback(null, entity);

    var node = res.node;

    entity.fromJSON(node.value);
    entity.__index = node.modifiedIndex;
    if (node.ttl) this.__expires = Date.now() + (node.ttl * 1000);

    callback(null, entity);
  });

  return this;
};

Entity.prototype.set = function(callback) {
  var entity = this;

  // CAS Constraints
  var options = {
    prevExist: !(this.isNew),
    ttl: this.__ttl
  };
  if (this.__index) options.prevIndex = this.__index;

  this.__client.set(this.__path, this, options, function(err, res) {
    if (err) return callback(err);

    this.__index = res.node.modifiedIndex;
    callback(null, entity);
  });

  return this;
};
Entity.prototype.save = Entity.prototype.set;

Entity.prototype.getOrCreate = function(callback) {
  this.get(function(err, entity) {
    if (err) return callback(err);
    if (!entity.isNew) return callback(null, entity);

    // Create it
    entity.set(callback);
  });

  return this;
};

Entity.prototype.touch = function(callback) {
  if (this.isNew) return this.set(callback);

  this.get(function(err) {
    if (err) return callback(err);
    this.set(callback);
  });

  return this;
};

Entity.prototype.del = function(callback) {
  var entity = this;

  if (this.isNew) return callback(null, false);

  this.__client.del(this.__path, {
    prevExist: true,
    prevIndex: this.__index
  }, function(err, res) {
    if (err) return callback(err);

    this.__index = null;
    callback(null, true);
  });

  return this;
};
Entity.prototype.destroy = Entity.prototype.del;

Entity.prototype.fromJSON = function(data) {
  Util._extend(this, data);
  return this;
};

Entity.prototype.toJSON = function() {
  var entity = this;
  var params = {};

  Object.keys(this).forEach(function(key) {
    if (key.slice(0, 2) === '__') return;
    params[key] = entity[key];
  });

  return params;
};
