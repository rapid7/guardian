var AuthN = require('../authn');
var AuthZ = require('../authz');

exports.attach = function(app) {
  app.get('/debug', function(req, res, next) {
    res.json({
      headers: req.headers,
      query: req.query,
      cookies: req.cookies,
      session: req.session,
      user: req.user,
      body: req.body
    });
  });

  app.get('/debug/secure',
    AuthN.enforce,
    AuthZ.enforce,
    function(req, res, next) {
      res.json({
        headers: req.headers,
        query: req.query,
        cookies: req.cookies,
        session: req.session,
        user: req.user,
        body: req.body
      });
    });

  app.get('/debug/config',
    AuthN.enforce,
    AuthZ.enforce,
    function(req, res, next) {
      res.json(Config.get());
    });
};
