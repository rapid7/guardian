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
var unshift = Array.prototype.unshift;

function arrayify(value) {
  return (value instanceof Array) ? value : [value];
}

function list(path, ids, callback, client) {
  var EntityClass = this;

  client.get(path, function(err, res) {
    if (err) return callback(err);
    if (!res || !res.node) return callback(null, {});
    if (!Array.isArray(res.node.nodes)) return callback(null, {});

    var collection = {};
    res.node.nodes.forEach(function(node) {
      var id = basename(node.key);

      // Query filter
      if (Array.isArray(ids) && ids.indexOf(id) < 0) return;

      var entity = new EntityClass(id);
      entity.fromJSON(node.value);
      entity.__index = node.modifiedIndex;
      if (node.ttl) entity.__expires = new Date(Date.now() + (node.ttl * 1000));

      collection[entity.id] = entity;
    });

    callback(null, collection);
  });
}

Store.extend = function(path, Child) {
  Util.inherits(Child, Entity);

  Child.list = function(filter, callback) {
    if (filter instanceof Function) {
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

  this.created = new Date();
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

    entity.__index = res.node.modifiedIndex;
    callback(null, entity);
  });

  return this;
};
Entity.prototype.save = Entity.prototype.set;

// Recursivly merge objects
function merge_update(entity, updates) {
  Object.keys(updates).forEach(function(key) {
    value = updates[key];

    switch (key) {
      case '$push':
        push.apply(entity, arrayify(value));
        return;
      case '$pop':
        // Argument must be numeric, and entity must be an array
        if (!isNaN(+value) && Array.isArray(entity[key]))
          entity[key].splice(-1 * value, value);
        return;
      case '$shift':
        // Argument must be numeric, and entity must be an array
        if (!isNaN(+value) && Array.isArray(entity[key]))
          entity[key].splice(0, value);
        return;
      case '$unshift':
        unshift.apply(entity, arrayify(value));
        return;
      case '$union':
        Util._extend(entity, value);
        return;
      case '$delete':
        arrayify(value).forEach(function(rm) {
          delete entity[rm];
        });
        return;
      default:
        // Recurse through object
        if (value instanceof Object && !Array.isArray(value)) {
          if (!(entity[key] instanceof value.constructor))
            entity[key] = new (value.constructor)();

          return merge_update(entity[key], value);
        }

        // Scalar or Array
        entity[key] = value;
    }
  });
}

Entity.prototype.update = function(updates, callback) {
  merge_update(this, updates);
  this.set(callback);

  return this;
};

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

    entity.update(params, callback);
  });

  return this;
};

Entity.prototype.touch = function(callback) {
  if (this.isNew) return this.set(callback);

  this.get(function(err, entity) {
    if (err) return callback(err);
    entity.set(callback);
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

    entity.__index = null;
    callback(null, true);
  });

  return this;
};
Entity.prototype.destroy = Entity.prototype.del;

Entity.prototype.findAndDelete = function(callback) {
  this.get(function(err, entity) {
    if (err) return callback(err);
    if (entity.isNew) return callback(null, entity, false);

    entity.del(function(err, deleted) {
      callback(err, entity, deleted);
    });
  });
};

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
