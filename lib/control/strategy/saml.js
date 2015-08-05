var FS = require('fs');
var Passport = require('passport');
var Path = require('path');
var SAML = require('passport-saml').Strategy;
var Util = require('util');

var User = require('../user');

exports.initialize = function(app, id, options) {
  var certificate = null;

  // Read SAML certificate if it exists
  if (options.certificate) {
    if (FS.existsSync(options.certificate))
      certificate = FS.readFileSync(options.certificate).toString('ascii');
    else
      console.log('WARN Certificate ' + options.certificate + ' does not exist!');
  }

  var params = Util._extend({}, options.params);
  options.login = Path.join('/provider', id, 'login');
  options.callback = params.path = Path.join('/provider', id, 'callback');
  params.cert = certificate;
  params.passReqToCallback = true;

  Passport.use(id, new SAML(params, function(req, profile, done) {
    if (!profile.nameID)
      return done(new Error('No identity found in SAML callback payload!'), false);

    User.findProvider(id, profile.nameID, function(err, provider) {
      if (err) return done(err);
      done(null, provider.User);
    });
  }));

  // Add SAML login endpoints
  app.get(options.login,
    Passport.authenticate(id, {
      failureRedirect: Config.get('authn:prefix') + '/login/failure',
    }));

  app.post(options.callback,
    Passport.authenticate(id, {
      failureRedirect: Config.get('authn:prefix') + '/login/failure',
    }),
    function(req, res) {
      res.redirect(req.session.returnTo || '/');
      delete req.session.returnTo;
    });

  return options;
};
