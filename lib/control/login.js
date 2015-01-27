var Passport = require('passport');

exports.attach = function(app) {
  app.get('/_guardian/login/failure', function(req, res, next) {
    res.status(401).send('Weee... Login Failed.');
  });

  app.get('/_guardian/logout', function(req, res, next) {
    res.status(501).send('Not implemented yet...');
  });
};
