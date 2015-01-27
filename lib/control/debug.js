var Auth = require('./auth');

exports.attach = function(app) {
  app.get('/_guardian/debug', function(req, res, next) {
    res.json({
      headers: req.headers,
      query: req.query,
      cookies: req.cookies,
      session: req.session,
      user: req.user,
      body: req.body
    });
  });

  app.get('/_guardian/debug/secure',
    Auth.enforcer,
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
};
