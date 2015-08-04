var Client = require('../util/client');
var Path = require('path');

var Session = module.exports = function(id, data, state, expire) {
  this.id = id;

  this.data = clone(data);
  this._data = data;

  this.state = state;
  this.expire = expire;
  this.destroyed = false;
};

var context = Session._context = {};

Session.connect = function() {
  context.client = new Client.JSON(Config.get('session:service'));
};

function sessionFromResponse(data, headers) {
  var session = new Session(headers['x-session-id'], data,
    headers['x-session-state']);

  session.expiresIn(headers['x-session-expire']);
  return session;
}

Session.create = function(callback) {
  context.client.post({
    pathname: '/session',
  }, function(err, data, res) {
    if (err) return callback(err);
    if (res.statusCode != 200) return callback(data);

    callback(null, sessionFromResponse(data, res.headers));
  });
};

Session.get = function(id, callback) {
  context.client.get({
    pathname: Path.join('/session', id),
  }, function(err, data, res) {
    if (err) return callback(err);

    if (res.statusCode == 404) return callback(null, false);
    if (res.statusCode != 200) return callback(data);

    callback(null, sessionFromResponse(data, res.headers));
  });
};

Session.find = function(id, callback) {
  if (id instanceof Function) {
    callback = id;
    id = null;
  }

  if (id == null) return this.create(callback);
  var _this = this;

  this.get(id, function(err, session) {
    if (err) return callback(err);
    if (session) return callback(null, session);

    _this.create(callback);
  });
};

Session.prototype.changed = function() {
  return !(equals(this.data, this._data));
};

Session.prototype.save = function(callback) {
  if (this.destroyed) return callback(null, false);
  var _this = this;

  context.client.put({
    pathname: Path.join('/session', this.id),
    headers: {
      'x-session-state': this.state,
      'x-session-expire': Config.get('session:expire'),
    },
  }, this.data, function(err, data, res) {
    if (err) return callback(err);
    if (!data.success) return callback(data);

    _this.state = res.headers['x-session-state'];
    _this.expiresIn(res.headers['x-session-expire']);
    _this._data = _this.data;
    _this.data = clone(this._data);

    callback(null, _this);
  });
};

Session.prototype.destroy = function(callback) {
  var _this = this;

  context.client.delete({
    pathname: Path.join('/session', this.id),
  }, function(err, data, res) {
    if (err) return callback(err);
    if (!data.success) return callback(data);

    _this.destroyed = true;
    delete _this.expire;

    callback(null, _this);
  });
};

Session.prototype.expiresIn = function(seconds) {
  this.expire = new Date(Date.now() +  (seconds * 1000));
};

function clone(object) {
  if (object == null) return object;

  // Deep-clone array
  if (object instanceof Array) return object.map(function(elm) {
    return (eml instanceof Object) ? clone(elm) : elm;
  });

  // Create a new instance of `object` and deep-clone keys
  var _clone = new (object.constructor)();
  Object.keys(object).forEach(function(key) {
    if (object[key] instanceof Object) return (_clone[key] = clone(object[key]));
    _clone[key] = object[key];
  });

  return _clone;
}

function equals(a, b) {
  if (b == null) return false;

  // Type Comparison
  if (a.constructor !== b.constructor) return false;

  // Deep-compare Arrays
  if (a instanceof Array) return a.reduce(function(eq, _, i) {
    if (a[i] instanceof Object) return (eq && equals(a[i], b[i]));
    return (eq && a[i] == b[i]);
  }, true);

  // Deep-compare object-keys
  if (a instanceof Object) return Object.keys(a).reduce(function(eq, key) {
    if (a[key] instanceof Object) return (eq && equals(a[key], b[key]));
    return (eq && a[key] == b[key]);
  }, true);

  return a == b;
}
