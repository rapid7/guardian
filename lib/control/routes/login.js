var AuthN = require('../authn');

exports.attach = function(app) {
  app.get('/login/failure', function(req, res, next) {
    res.status(401).json({ action: 'login', status: 'failure' });
  });

  app.get('/logout',
    AuthN.enforce,
    function(req, res, next) {
      res.logout(function(err) {
        if (err) return next(err);
        res.redirect('/_guardian/logout/success');
      });
    });

  app.get('/logout/success', function(req, res, next) {
    res.json({ action: 'logout', status: 'success' });
  });
};
