var FS = require('fs');
var Express = require('express');
var Passport = require('passport');
var SAML = require('passport-saml').Strategy;
var Body = require('../body');
var User = require('../../model/accounting').User;


exports.login = '/_saml/login';
exports.callback = '/_saml/callback';

exports.initialize = function(app) {
  var certificate = FS
    .readFileSync(Config.get('strategy:certificate'))
    .toString('ascii');

  var params = Config.get('strategy:params');
  params.path = exports.callback;
  params.cert = certificate;

  Passport.use(new SAML(params, function(profile, done) {
    if (!profile.email) return done(new Error('No email found'), null);

    var user = new User(profile.email);
    user.saml = profile;
    user.getOrCreate(done);
  }));

  Passport.serializeUser(function(user, done) {
    done(null, user.saml.nameID);
  });
  Passport.deserializeUser(function(id, done) {
    new User(id).get(done);
  });

  // Add SAML login endpoints
  var router = Express.Router();
  Body.attach(router);

  router.get('/login', Passport.authenticate('saml', {
    failureRedirect: '/_guardian/login/failure'
  }));

  router.post('/callback',
    Passport.authenticate('saml', {
      failureRedirect: '/_guardian/login/failure',
      failureFlash: true
    }),
    function(req, res) {
      res.redirect(req.session.login_return || '/');
    });

  app.use('/_saml', router);
};
