var Session = require('../../model/session');

var AuthN = require('../authn');
var AuthZ = require('../authz');
var ProxyControl = require('../proxy');

var Body = require('../body');
var Express = require('express');

exports.attach = function(app) {
  var router = Express.Router();
  Body.attach(router);

  router.use(AuthN.enforce);
  router.use(AuthZ.enforce);

  router.get('/debug', function(req, res, next) {
    res.json({
      headers: req.headers,
      cookies: req.cookies,
      session: req.session,
      user: req.user
    });
  });

  router.get('/config', function(req, res, next) {
    res.json(Config.get());
  });

  router.get('/sessions', function(req, res, next) {
    Session.list(function(err, sessions) {
      if (err) return next(err);

      Object.keys(sessions).forEach(function(key) {
        sessions[key].expires = sessions[key].__expires;
      });

      res.json(sessions);
    });
  });

  app.use('/_status', router);
};
