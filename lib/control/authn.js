var Passport = require('passport');
var URL = require('url');

var Strategies = exports.Strategies = {
  OAuth2: require('./provider/oauth2'),
  SAML: require('./provider/saml'),
  Slack: require('./provider/slack')
};

var strategy;

exports.attach = function(app) {
  strategy = Strategies[Config.get('strategy:provider')];
  if (!strategy) throw new ReferenceError('Authentication strategy ' + Config.get('strategy:provider') +
    ' is not defined. Please use one of ' + Object.keys(Strategies).join(', ') + '.');

  app.use(Passport.initialize());
  app.use(Passport.session());

  strategy.initialize(app);
};

exports.enforce = function(req, res, next) {
  if (req.isAuthenticated()) {
    delete req.session.login_return;
    return next();
  }

  req.session.login_return = req.originalUrl;
  res.redirect(strategy.login);
};
