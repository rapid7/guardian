var Session = require('../util/client/session');
var Cookie = require('./cookie');

exports.attach = function(app) {
  Session.connect();
  Cookie.attach(app);

  app.use(function(req, res, next) {
    var cookie = Config.get('session:cookie');

    Session.find(req.cookie(cookie.name), function(err, session) {
      if (err) return next(err);

      res.logout = function(callback) {
        this.rmCookie(cookie.name);
        session.destroy(callback);
      };

      req.session = res.session = session.data;
      res.cookie(cookie.name, session.id, cookie.options);

      res.on('finish', function() {
        if (session.destroyed) return;

        session.save(function(err) {
          if (err) console.log(err);
        });
      });

      next();
    });
  });
};
