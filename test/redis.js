
if (!Config) require('../lib/config');
if (!redis) global.redis = require('../lib/util/redis').connect();

global.sets = function(k, v) {
  redis.sets(k, v, function(err, created, state, expire) {
    console.log(err);
    console.log(created);
    console.log(state);
    console.log(expire);
  });
};

global.gets = function(k, v) {
  redis.gets(k, function(err, data, state, expire) {
    console.log(err);
    console.log(data);
    console.log(state);
    console.log(expire);
  });
};

global.cas = function(k, v, state, expire) {
  redis.cas(k, v, state, expire, function(err, updated, state, expire) {
    console.log(err);
    console.log(updated);
    console.log(state);
    console.log(expire);
  });
};

global.expires = function(k, expires) {
  redis.expires(k, expires, function(err, updated, state, expire) {
    console.log(err);
    console.log(updated);
    console.log(state);
    console.log(expire);
  });
};

global.dels = function(k) {
  redis.dels(k, function(err, deleted) {
    console.log(err);
    console.log(deleted);
  });
};
