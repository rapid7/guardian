var FS = require('fs');
var Passport = require('passport');
var SAML = require('passport-saml').Strategy;

exports.login = '/_guardian/saml/login';
exports.callback = '/_guardian/saml/callback';

exports.initialize = function(app) {
  var certificate = FS
    .readFileSync(Config.get('strategy:certificate'))
    .toString('ascii');

  var users = exports.users =  {};
  var params = Config.get('strategy:params');
  params.cert = certificate;

  Passport.use(new SAML(params, function(profile, done) {
    if (!profile.email) return done(new Error('No email found'), null);

    // TODO Authorization Control?!
    users[profile.nameID] = profile;
    done(null, profile);
  }));

  Passport.serializeUser(function(user, done) {
    done(null, user.nameID);
  });
  Passport.deserializeUser(function(id, done) {
    done(null, users[id]);
  });

  // Add SAML login endpoints
  app.get(exports.login, Passport.authenticate('saml', {
    failureRedirect: '/_guardian/login/failure'
  }));

  app.post(exports.callback,
    Passport.authenticate('saml', { failureRedirect: '/_guardian/login/failure', failureFlash: true }),
    function(req, res) {
      res.redirect(req.session.login_return || '/');
    });
};
