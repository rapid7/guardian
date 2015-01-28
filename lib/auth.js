var Passport = require('passport');
var Strategies = exports.Strategies = {
  OAuth2: require('./provider/oauth2'),
  SAML: require('./provider/saml'),
  Slack: require('./provider/slack')
};
var URL = require('url');

var users = {};
var strategy;

exports.attach = function(app) {
  strategy = Strategies[Config.get('strategy:provider')];
  if (!strategy) throw new ReferenceError('Authentication strategy ' + Config.get('strategy:provider') +
    ' is not defined. Please use one of ' + Object.keys(Strategies).join(', ') + '.');

  app.use(Passport.initialize());
  app.use(Passport.session());

  strategy.initialize(app);
};

var enforcer = exports.enforcer = function(req, res, next) {
  if (req.isAuthenticated()) {
    req.session.login_return = undefined;
    return next();
  }

  req.session.login_return = req.path;
  res.redirect(strategy.login);
};

exports.enforce = function(app) {
  app.use(enforcer);
};
