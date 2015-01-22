var FS = require('fs');
var Passport = require('passport');
var SAML = require('passport-saml');

var certificate = FS
  .readFileSync(Config.get('provider:certificate'))
  .toString('ascii');

var users = {};
Passport.use(new SAML.Strategy(Config.get('provider'),
  function(profile, done) {
    if (!profile.email) return done(new Error('No email found'), null);

    users[profile.nameID] = profile;
    done(null, profile);
  }));

Passport.serializeUser(function(user, done) {
  done(null, user.nameID);
});

Passport.deserializeUser(function(id, done) {
  done(null, users[id]);
});

exports.attach = function(app) {
  app.use(Passport.initialize());
  app.use(Passport.session());
};

var enforcer = exports.enforcer = function(req, res, next) {
  if(!req.isAuthenticated()) return res.redirect('/_login?login_return=' + req.path);
  next();
};

exports.enforce = function(app) {
  app.use(enforcer);
};
