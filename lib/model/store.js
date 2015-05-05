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
var join = Store.join = require('path').join;
var basename = Store.basename = require('path').basename;
var push = Array.prototype.push;

function list(path, ids, callback, client) {
  var EntityClass = this;

  client.get(path, function(err, res) {
    if (err) return callback(err);
    if(!res || !res.node) return callback(null, {});
    if(!Array.isArray(res.node.nodes)) return callback(null, {});

    var collection = {};
    res.node.nodes.forEach(function(node) {
      var id = basename(node.key);

      // Query filter
      if(Array.isArray(ids) && ids.indexOf(id) < 0) return;

      var entity = new EntityClass(id);
      entity.fromJSON(node.value);
      entity.__index = node.modifiedIndex;
      if (node.ttl) entity.__expires = new Date(Date.now() + (node.ttl * 1000));

      collection[entity.id] = entity;
    });

    callback(null, collection);
  });
}

/**
 * Handle different update/merge strategies
 */
function update(entity, updates) {
  Object.keys(updates).forEach(function(key) {
    update_v = updates[key];

    // Popluate structure if it's not defined and recurse
    if (update_v instanceof Object) {

      // Perform a union
      if(update_v.hasOwnProperty('$union')) {
        update_v = update_v.$union;
        if (!(entity[key] instanceof update_v.constructor))
          entity[key] = new (update_v.constructor)();

        if(Array.isArray(update_v)) return push.apply(entity[key], update_v);
        return Uitl._extend(entity[key], update_v);
      }

      if (!(entity[key] instanceof update_v.constructor))
        entity[key] = new (update_v.constructor)();

      return update(entity[key], update_v);
    }

    // Boring scalar.
    entity[key] = update_v;
  });
}

Store.extend = function(path, Child) {
  Util.inherits(Child, Entity);

  Child.list = function(filter, callback) {
    if(filter instanceof Function) {
      callback = filter;
      filter = undefined;
    }

    list.call(this, path, filter, callback, Store.client);
  };
};

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

Object.defineProperty(Entity.prototype, 'id', {
  get: function() {
    return basename(this.__path);
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
    if (node.ttl) entity.__expires = new Date(Date.now() + (node.ttl * 1000));

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

Entity.prototype.updateOrCreate = function(params, callback) {
  this.get(function(err, entity) {
    if (err) return callback(err);

    update(entity, params);
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
