var Body = require('../body');
var Express = require('express');
var FS = require('fs');
var Passport = require('passport');
var Path = require('path');
var SAML = require('passport-saml').Strategy;
var User = require('../../model/accounting').User;
var Util = require('util');

exports.initialize = function(router, options) {
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
    User.byName(profile.email).updateOrCreate({
      providers: {
        $union: update
      }
    }, done);
  }));

  // Add SAML login endpoints
  router.get(Path.join('/', options.name, '/login'),
    Passport.authenticate(options.name, {
      failureRedirect: '/_authn/login/failure'
    }));

  router.post(Path.join('/', options.name, '/callback'),
    Passport.authenticate(options.name, {
      failureRedirect: '/_authn/login/failure',
      failureFlash: true
    }),
    function(req, res) {
      res.redirect(req.session.return_to || '/');
    });

  options.login = Path.join('/_authn', options.name, 'login');
  options.callback = Path.join('/_authn', options.name, 'callback');
  return options;
};
