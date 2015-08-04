var FS = require('fs');
var Passport = require('passport');
var Path = require('path');
var SAML = require('passport-saml').Strategy;
var Util = require('util');

var Model = require('../../model');

var User = Model.load('user');
var Provider = Model.load('provider');

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

  Passport.use(id, new SAML(params, function(profile, done) {
    if (!profile.nameID)
      return done(new Error('No identity found in SAML callback payload!'), false);

    console.log('SAML user ' + profile.nameID)
    done(null, {
      id: profile.nameID
    });
    // Provider.findOne({
    //   where: {
    //     name: name,
    //     identity: profile.nameID,
    //   },
    //   include: [User],
    // }).then(function(provider) {
    //   console.log('Find provider');
    //   console.log(provider);
    //   done(null, provider.User);
    // }).catch(done);
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
