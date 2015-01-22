var Auth = require('./auth');

exports.attach = function(app) {
  app.get('/_debug', function(req, res, next) {
    res.json({
      headers: req.headers,
      query: req.query,
      cookies: res.cookies,
      session: req.session,
      user: req.user,
      body: req.body
    });
  });

  app.get('/_debug/secure',
    Auth.enforcer,
    function(req, res, next) {
      res.json({
        headers: req.headers,
        query: req.query,
        cookies: res.cookies,
        session: req.session,
        user: req.user,
        body: req.body
      });
    });
};
