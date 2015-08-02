/**
 * Client stub for the session service
 */
var Client = require('../client');
var Path = require('path');

var Session = module.exports = function(id, data, state, expire) {
  this.id = id;
  this.data = data;
  this.state = state;
  this.expire = expire;
  this.destroyed = false;
};

var context = Session._context = {};

Session.connect = function() {
  context.client = new SessionClient();
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

Session.prototype.save = function(callback) {
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

var SessionClient = Session.Client = function() {
  Client.JSON.call(this, Config.get('session:service'));
};

Client.JSON.extend(SessionClient);
