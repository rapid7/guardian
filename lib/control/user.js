var User = require('../model').load('user');
var Provider = require('../model').load('provider');

/**
 * Find user by entity ID. Used by deserializeUser
 */
exports.findById = function(id, callback) {
  User.findById(id).then(function(user) {
    callback(null, user);
  }, callback);
};

/**
 * Find a provider entity by it's id and the user identity.
 * Used in login callbacks.
 */
exports.findProvider = function(name, identity, options, callback) {
  if (options instanceof Function) {
    callback = options;
    options = {};
  }

  options = options || {};

  Provider.findOrCreate({
    where: {
      name: name,
      identity: identity,
    },
    defaults: {
      name: name,
      identity: identity,
      token: options.token,
    },
    include: [User],
  }).then(function(provider) {
    provider = provider[0];

    if (provider.User) return callback(null, provider);

    // Meh... No time to implement the registration flow ATM
    User.create({
      name: identity,
    }).then(function(user) {
      provider.setUser(user).then(function(provider) {
        provider.User = user;
        callback(null, provider);
      }, callback);
    }, callback);
  }, callback);
};
