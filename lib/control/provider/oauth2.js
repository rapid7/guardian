var Passport = require('passport');
var OAuth2 = require('passport-oauth2').Strategy;
var Crypto = require('crypto');

exports.login = '/_guardian/oauth2/login';
exports.callback = '/_guardian/oauth2/callback';

exports.initialize = function(app) {
  var users = exports.users =  {};
  var params = Config.get('strategy:params');

  params.state = true;
  params.callbackURL = URL.format(Util._extend(Config.get('service:domain'), {
    pathname: '/_guardian/oauth2/callback'
  }));

  Passport.use(new OAuth2(params, function(token, refresh, profile, done) {
    profile.id = Crypto.randomBytes(33).toString('base64');
    profile.token = token;
    profile.refresh = refresh;

    users[profile.id] = profile;
    done(null, profile);
  }));

  Passport.serializeUser(function(user, done) {
    done(null, user.id);
  });
  Passport.deserializeUser(function(id, done) {
    done(null, users[id]);
  });

  // Add OAuth2 login endpoints
  app.get(exports.login, Passport.authenticate('oauth2'));
  app.get(exports.callback,
    Passport.authenticate('oauth2', { failureRedirect: '/_guardian/login/failure' }),
    function(req, res, next) {
      res.redirect(req.session.login_return || '/');
    });
};
