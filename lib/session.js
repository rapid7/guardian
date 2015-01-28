var Session = require('express-session');
var Redis = require('redis');
var Util = require('util');

var RedisStore = exports.RedisStore = function(options) {
  Session.Store.call(this, options);

  this._client = Redis.createClient(
    Config.get('session:store:port'),
    Config.get('session:store:hostname'));
  this.ttl = Config.get('session:expire');
};
Util.inherits(RedisStore, Session.Store);

RedisStore.prototype.get = function(id, callback) {
  this._client.get('Guardian::Session::' + id, function(err, data) {
    if (err) return callback(err);

    try {
      data = JSON.parse(data.toString());
      callback(null, data);
    } catch (e) {
      callback(e);
    }
  });
};

RedisStore.prototype.set = function(id, data, callback) {
  try {
    data = JSON.stringify(data);
    this._client.setex('Guardian::Session::' + id, this.ttl, data, callback);
  } catch (e) {
    callback(e);
  }
};

RedisStore.prototype.destroy = function(id, callback) {
  this._client.del('Guardian::Session::' + id, callback);
};

RedisStore.prototype.touch = function(id, callback) {
  this._client.expire('Guardian::Session::' + id, this.ttl, callback);
};

RedisStore.prototype.length = function(callback) {
  this._client.keys('Guardian::Session::*', callback);
};

exports.attach = function(app) {
  app.use(Session({
    name: Config.get('session:name'),
    cookie: {
      secure: Config.get('session:cookie:secure'),
      httpOnly: Config.get('session:cookie:httpOnly'),
      maxAge: Config.get('session:expire') * 1000
    },
    rolling: true,
    resave: true,
    saveUninitialized: true,
    secret: Config.get('session:secret'),
    store: new RedisStore()
  }));
};
