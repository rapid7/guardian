var Passport = require('passport');

exports.attach = function(app) {
  app.get('/_login',
    function(req, res, next) {
      // Stash the return path in the session
      if(req.query.login_return) req.session.login_return = req.query.login_return;
      next();
    },
    Passport.authenticate('saml', { failureRedirect: '/_login/failure', failureFlash: true }),
    function(req, res, next) {
      res.redirect('/_login/failure');
    });

  app.post('/_login/callback',
    Passport.authenticate('saml', { failureRedirect: '/_login/failure', failureFlash: true }),
    function(req, res) {
      res.redirect(req.session.login_return || '/');
    });

  app.get('/_login/failure', function(req, res, next) {
    res.status(401).send('Weee... Login Failed.');
  });

  app.get('/_logout', function(req, res, next) {
    res.status(501).send('Not implemented yet...');
  });
};
