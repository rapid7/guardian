var AuthN = require('../authn');
var Body = require('../body');
var Express = require('express');

exports.attach = function(app) {
  var router = Express.Router();
  Body.attach(router);

  router.get('/login/failure', function(req, res, next) {
    res.status(401).json({ action: 'login', status: 'failure' });
  });

  router.get('/logout',
    AuthN.enforce,
    function(req, res, next) {
      res.logout(function(err) {
        if (err) return next(err);
        res.redirect('/_authn/logout/success');
      });
    });

  router.get('/logout/success', function(req, res, next) {
    res.json({ action: 'logout', status: 'success' });
  });

  app.use('/_authn', router);
};
