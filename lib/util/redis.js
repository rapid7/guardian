/**
 * Helper utilities for Redis
 */
var Crypto = require('crypto');
var FS = require('fs');
var Path = require('path');
var Redis = require('redis');

var context = exports._context = {};

exports.connect = function() {
  if (context.client) return context.client;
  console.log('Redis: connecting to server');

  var client = context.client =
    Redis.createClient(Config.get('session:store:port'),
      Config.get('session:store:host'),
      Config.get('session:store:options'));

  initialize();

  return client;
};

function initialize() {
  script('cas', function(err, sha) {
    return function(key, value, match, expire, callback) {
      var params = [sha, 3, key, value, match];

      if (expire instanceof Function) {
        callback = expire;
      } else {
        params.push(expire);
      }

      context.client.evalsha(params, function(err, values) {
        if (err) return callback(err);
        callback(null, values[0], values[1], values[2]);
      });
    };
  });

  script('gets', function(err, sha) {
    return function(key, callback) {
      context.client.evalsha([sha, 1, key], function(err, values) {
        if (err) return callback(err);
        callback(null, values[0], values[1], values[2]);
      });
    };
  });

  script('expires', function(err, sha) {
    return function(key, expire, callback) {
      context.client.evalsha([sha, 2, key, expire], function(err, values) {
        if (err) return callback(err);
        callback(null, values[0], values[1], values[2]);
      });
    };
  });

  script('sets', function(err, sha) {
    return function(key, value, expire, callback) {
      var params = [sha, 2, key, value];

      if (expire instanceof Function) {
        callback = expire;
      } else {
        params.push(expire);
      }

      context.client.evalsha(params, function(err, values) {
        if (err) return callback(err);
        callback(null, values[0], values[1], values[2]);
      });
    };
  });

  script('dels', function(err, sha) {
    return function(key, callback) {
      context.client.evalsha([sha, 1, key], function(err, values) {
        if (err) return callback(err);
        callback(null, values[0]);
      });
    };
  });
}

function scriptPath(name) {
  return Path.join(__dirname, '../../redis/script', name + '.lua');
}

// Load a script into Redis
function script(name, callback) {
  context.client.script('load',
    FS.readFileSync(scriptPath(name)),
    function(err, sha) {
      context.client[name] = callback(err, sha);
      console.log('Redis: loaded ' + name + ' (' + sha + ')');
    });
}

exports.script = script;
