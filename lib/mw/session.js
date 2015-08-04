var Session = require('../model/session');
var Cookie = require('./cookie');

exports.attach = function(app) {
  Session.connect();
  Cookie.attach(app);

  app.use(function(req, res, next) {
    var cookie = Config.get('session:cookie');

    Session.find(req.cookie(cookie.name), function(err, session) {
      req.log('SESSION.FETCH', {
        id: session.id,
      });
      if (err) return next(err);

      res.logout = function(callback) {
        this.rmCookie(cookie.name, cookie.options);
        session.destroy(callback);
      };

      req.session = res.session = session.data;
      req._session = res._session = session;
      if (res.locals) res.locals.session = session.data;

      res.cookie(cookie.name, session.id, cookie.options);

      res.before('headers', function(done) {
        if (!session.changed()) {
          res.log('SESSION.UNCHANGED');
          return done();
        }

        res.log('SESSION.SAVE');
        session.save(function(err) {
          res.log('SESSION.SAVED', err || {
            success: true,
          });
          done();
        });
      });

      next();
    });
  });
};
