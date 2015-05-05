var Session = require('../model/session');

exports.attach = function(app, options) {
  options = options || {};

  var cookieName = options.cookieName || 'guardian.session';
  var maxAge = options.maxAge || 3600;

  function logout(callback) {
    this.rmCookie(cookieName);
    this.session.destroy(callback);
  }

  app.use(function(req, res, next) {
    var session = req.session =
      res.session = new Session(req.cookie(cookieName));
    session.__ttl = maxAge;

    res.cookie(cookieName, session.id, {
      maxAge: maxAge
    });

    res.logout = logout;

    res.on('finish', function() {
      if (session.destroyed) return;

      session.set(function(err) {
        req.log('SESSION_SET', {
          session: session.id,
          success: !err
        });
      });
    });

    session.getOrCreate(function(err) {
      req.log('SESSION_GET', {
        session: session.id
      });

      next(err);
    });
  });
};
