
require('../lib/config');
var Redis = require('../lib/util/redis');

global.redis = {
  _connection: null,
  connect: function() {
    this._connection = Redis.connect();
  },

  disconnect: function() {
    this._connection.quit();
  },

  sets: function(k, v) {
    this._connection.sets(k, v, function(err, created, state, expire) {
      if (err) return console.log(err);
      console.log('Updated: ' + !!updated + ', CAS: ' + state + ', Expires: ' + expires);
    });
  },

  gets: function(k, v) {
    this._connection.gets(k, function(err, data, state, expire) {
      if (err) return console.log(err);
      console.log('CAS: ' + state + ', Expires: ' + expires + ', Data:');
      console.log(data);
    });
  },

  cas: function(k, v, state, expire) {
    this._connection.cas(k, v, state, expire, function(err, updated, state, expire) {
      if (err) return console.log(err);
      console.log('Updated: ' + !!updated + ', CAS: ' + state + ', Expires: ' + expires);
    });
  },

  expires: function(k, expires) {
    this._connection.expires(k, expires, function(err, updated, state, expire) {
      if (err) return console.log(err);
      console.log('Updated: ' + !!updated + ', CAS: ' + state + ', Expires: ' + expires);
    });
  },

  dels: function(k) {
    this._connection.dels(k, function(err, deleted) {
      if (err) return console.log(err);
      console.log('Deleted: ' + !!deleted);
    });
  },

};
