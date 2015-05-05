var Accounting = require('../model/accounting');
var Path = require('path');

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
    req.resource = Path.normalize(req.originalUrl).toLowerCase();

    next();
  });
};

function matchAction(statement, action) {
  if (statement.action === '*') return true;
  if (Array.isArray(statement.action) &&
      statement.action.indexOf(action) > -1) return true;

  return statement.action == action;
}

function matchResource(statement, resource) {
  resource = resource.split('/');
  resource.pop(); // remove leading ''

  // This can never happen
  if(resource.length < statement.resource.length) return false;

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
};
