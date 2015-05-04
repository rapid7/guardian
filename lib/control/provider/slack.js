var Passport = require('passport');
var OAuth2 = require('passport-oauth2').Strategy;
var Crypto = require('crypto');
var URL = require('url');
Util = require('util');

exports.login = '/_guardian/slack/login';
exports.callback = '/_guardian/slack/callback';

exports.initialize = function(app) {
  var users = exports.users = {};
  var params = Config.get('strategy:params');

  params.state = true;
  params.authorizationURL = 'https://slack.com/oauth/authorize';
  params.tokenURL = 'https://slack.com/api/oauth.access';
  params.callbackURL = URL.format(Util._extend(Config.get('service:domain'), {
    pathname: exports.callback
  }));

  var handler = new OAuth2(params, function(token, _, profile, done) {
    profile.id = Crypto.randomBytes(36).toString('base64');
    profile.token = token;

    users[profile.id] = profile;
    done(null, profile);
  });

  // Load profile from Slack API
  handler.userProfile = function(token, done) {
    this._oauth2._request('GET', URL.format({
      protocol: 'https',
      hostname: 'slack.com',
      pathname: '/api/auth.test',
      query: {
        token: token
      }
    }), {}, '', '', function(err, info) {
      if (err) return done(err);
      try {
        info = JSON.parse(info);
        if (!info.ok) return done(info.error || info);

        delete info.ok;
        done(null, info);
      } catch (e) {
        done(e);
      }
    });
  };

  Passport.use('slack', handler);

  Passport.serializeUser(function(user, done) {
    done(null, user.id);
  });
  Passport.deserializeUser(function(id, done) {
    done(null, users[id]);
  });

  // Add OAuth2 login endpoints
  app.get(exports.login, Passport.authenticate('slack'));
  app.get(exports.callback,
    Passport.authenticate('slack', {
      failureRedirect: '/_guardian/login/failure'
    }),
    function(req, res, next) {
      res.redirect(req.session.login_return || '/');
    });
};
