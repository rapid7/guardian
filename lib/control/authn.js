var Express = require('express');
var Passport = require('passport');
var User = require('./user');

var context = exports._context = {};
var providers = context.providers = {};

var users = {};

/**
 * Lazy helper to initialize providers from configuration
 */
exports.providers = function(app) {
  if (!context.hasOwnProperty('router'))
    throw ReferenceError('Call `authn.attach(app)` first to initialize authentication!');

  var configuration = Config.get('authn:providers');

  Object.keys(configuration).forEach(function(id) {
    console.log('AuthN: Using provider ' + id + ' (' + configuration[id].strategy + ')');
    provider(context.router, id, configuration[id]);
  });

  return this;
};

/**
 * Add controllers to the applicable
 */
exports.attach = function(app) {
  app.use(Passport.initialize());
  app.use(Passport.session());

  // Create a router for authn endpoints. Attach before
  // access control middleware.
  var router = context.router = Express.Router();
  require('../mw/body').attach(router);

  app.use(function(req, res, next) {
    res.locals.authenticated = req.isAuthenticated();
    next();
  });

  app.use(Config.get('authn:prefix'), router);
  app.locals.prefix = Config.get('authn:prefix');

  Passport.serializeUser(function(req, user, done) {
    done(null, user.id);
  });

  Passport.deserializeUser(function(req, id, done) {
    User.findById(id, done);
  });

  if (Config.get('authn:status')) router.get('/status.json',
      enforce, function(req, res, next) {
        res.json({
          cookies: req.cookies,
          session: req.session,
          user: req.user,
        });
      });

  /**
   * Control Routes
   */
  router.get('/login', function(req, res) {
    if (req.accepts('html')) return res.render('authn/login.ejs', {
      providers: providers,
    });

    res.json(providers);
  });

  router.get('/login/failure', function(req, res, next) {
    res.status(401);

    if (req.accepts('html'))
      return res.render('authn/failure.ejs');

    res.json({
      action: 'login',
      status: 'failure',
    });
  });

  // router.get('/register', function(req, res, next) {
  //
  // });

  router.get('/logout', enforce, function(req, res, next) {
    res.logout(function(err) {
      if (err) return next(err);
      res.redirect(Config.get('authn:prefix') + '/logout/success');
    });
  });

  router.get('/logout/success', function(req, res, next) {
    if (req.accepts('html'))
      return res.render('authn/logout.ejs');

    res.json({
      action: 'logout',
      status: 'success',
    });
  });

  return this;
};

/**
 * Load included authentication strategies.
 *
 * -- Additional strategies can be added before the controller is initialized
 */
var Strategies = exports.Strategies = {
  SAML: require('./strategy/saml'),

  // OAuth2: require('./strategy/oauth2'),
  // Slack: require('./strategy/slack'),
};

function provider(app, id, options) {
  if (providers[id]) throw Error('Provider ' + id + ' is already defined!');

  // Make sure that the strategy exists
  if (!Strategies.hasOwnProperty(options.strategy))
    throw new ReferenceError('Authentication strategy ' + options.strategy +
      ' is not defined. Please use one of ' +
      Object.keys(Strategies).join(', ') + '.');

  providers[id] = Strategies[options.strategy].initialize(app, id, options);
  return this;
}

exports.provider = provider;

/**
 * Enforce Authentication
 */
function enforce(req, res, next) {
  if (req.isAuthenticated()) {
    delete req.session.returnTo;
    return next();
  }

  req.session.returnTo = req.originalUrl;
  res.redirect(Config.get('authn:prefix') + '/login?referer=' + req.id);
}

exports.enforce = function(app) {
  app.use(enforce);
  return this;
};
