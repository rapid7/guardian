var Path = require('path');
var URL = require('url');

var Model = require('../model');

Model.load('policy');
Model.load('statement');
Model.load('action');
Model.load('route');
Model.load('service');

exports.attach = function(app) {
  function unauthorized() {
    this.log('AUTHZ', {
      authorized: false,
      action: this.req.action,
      resource: this.req.resource
    });

    this.status(401).json({
      authorized: false,
      action: this.req.action,
      resource: this.req.resource
    });
  }

  app.use(function(req, res, next) {
    res.unauthorized = unauthorized;

    // Normalize
    req.action = req.method.toLowerCase();

    var original = URL.parse(req.originalUrl);
    req.resource = Path.normalize(original.pathname).toLowerCase().split('/');
    if (req.resource[0] === '') req.resource.shift(); // remove leading ''

    next();
  });

  return this;
};

function matchAction(statement, action) {
  if (statement.action === '*') return true;
  if (Array.isArray(statement.action) &&
      statement.action.indexOf(action) > -1) return true;

  return statement.action == action;
}

function matchResource(statement, resource) {
  // This can never happen
  if(resource.length < statement.resource.length - 1) return false;

  for(var i = 0; i < statement.resource.length; i++) {
    // Trailing wildcard match
    if (statement.resource[i] === '*' &&
        i == (statement.resource.length - 1)) return true;

    // Intermediate wildcard
    if (statement.resource[i] === '*') continue;

    // Hard mis-match
    if (statement.resource[i] != resource[i]) return false;
  }

  // Exact match
  return true;
}

exports.enforce = function(req, res, next) {
  // Ensure that a user has been attached to the transaction
  if (!req.user) return res.unauthorized();

  req.user.getAuthorizations(function(err, authorizations) {
    if (err) return next(err);

    // Interate over authorizations' statements
    for (var a in authorizations) {
      var authorization = authorizations[a];
      for (var s in authorization.statements) {
        var statement = authorization.statements[s];

        // Matching authorization?
        if (matchAction(statement, req.action) &&
            matchResource(statement, req.resource)) {
              res.authorization = authorization;

              req.log('AUTHZ', {
                authorized: true,
                action: req.action,
                resource: req.resource,
                authorization: authorization.id
              });
              return next();
            }
      }
    }

    // Nope.
    res.unauthorized();
  });

  return this;
};
