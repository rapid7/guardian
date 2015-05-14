var Body = require('./body');
var Express = require('express');
var Passport = require('passport');
var URL = require('url');
var User = require('../model/accounting').User;

var Strategies = exports.Strategies = {
  // OAuth2: require('./authn/oauth2'),
  SAML: require('./authn/saml'),
  // Slack: require('./authn/slack')
};

exports.attach = function(app, options) {
  options = options || {};
  if (!Strategies.hasOwnProperty(options.provider))
    throw new ReferenceError('Authentication strategy ' + options.provider +
      ' is not defined. Please use one of ' + Object.keys(Strategies).join(', ') + '.');

  app.use(Passport.initialize());
  app.use(Passport.session());

  Passport.serializeUser(function(user, done) {
    done(null, user.id);
  });
  Passport.deserializeUser(function(id, done) {
    new User(id).get(done);
  });

  var router = Express.Router();
  Body.attach(router);

  router.get('/login/failure', function(req, res, next) {
    res.status(401).json({ action: 'login', status: 'failure' });
  });

  router.get('/logout', enforce, function(req, res, next) {
    res.logout(function(err) {
      if (err) return next(err);
      res.redirect('/_authn/logout/success');
    });
  });

  router.get('/logout/success', function(req, res, next) {
    res.json({ action: 'logout', status: 'success' });
  });

  exports.strategy = Strategies[options.provider].initialize(router, options);
  app.use('/_authn', router);
};

function enforce(req, res, next) {
  if (req.isAuthenticated()) {
    req.log('AUTHN', {
      authenticated: true,
      user: req.user.id
    });

    delete req.session.return_to;
    return next();
  }

  req.log('AUTHN', {
    authenticated: false,
    return_to: req.originalUrl
  });

  req.session.return_to = req.originalUrl;
  res.redirect(exports.strategy.login);
}
exports.enforce = enforce;
