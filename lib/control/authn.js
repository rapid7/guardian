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

  exports.strategy = Strategies[options.provider].initialize(app, options);
};

exports.enforce = function(req, res, next) {
  if (req.isAuthenticated()) {
    req.log('AUTHN', {
      authenticated: true,
      user: req.user.id
    });

    delete req.session.login_return;
    return next();
  }

  req.log('AUTHN', {
    authenticated: false,
    login_return: req.originalUrl
  });

  req.session.login_return = req.originalUrl;
  res.redirect(exports.strategy.login);
};
