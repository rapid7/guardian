var Body = require('../body');
var Express = require('express');
var FS = require('fs');
var Passport = require('passport');
var Path = require('path');
var SAML = require('passport-saml').Strategy;
var User = require('../../model/accounting').User;
var Util = require('util');

exports.initialize = function(app, options) {
  options = Util._extend({
    name: 'saml',
  }, options);

  var certificate;

  // Read SAML certificate if it exists
  if(options.certificate) {
    if (FS.existsSync(options.certificate))
      certificate = FS.readFileSync(options.certificate).toString('ascii');
    else
      console.log('WARN Certificate ' + options.certificate + ' does not exist!');
  }

  var params = Util._extend({}, options.params);
  params.path = exports.callback;
  params.cert = certificate;

  Passport.use(options.name, new SAML(params, function(profile, done) {
    if (!profile.email) return done(new Error('No email found'), null);

    var update = {};
    update[options.name] = profile;

    // Store updated provider data
    User.byName(profile.email).updateOrCreate(update, done);
  }));

  // Add SAML login endpoints
  var router = Express.Router();
  Body.attach(router);

  router.get('/login', Passport.authenticate(options.name, {
    failureRedirect: '/_authn/login/failure'
  }));

  router.post('/callback',
    Passport.authenticate(options.name, {
      failureRedirect: '/_authn/login/failure',
      failureFlash: true
    }),
    function(req, res) {
      res.redirect(req.session.login_return || '/');
    });

  app.use(Path.join('/_authn', options.name), router);

  options.login = Path.join('/_authn', options.name, 'login');
  options.callback = Path.join('/_authn', options.name, 'callback');
  return options;
};
