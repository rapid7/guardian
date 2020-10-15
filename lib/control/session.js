var Redis = require('../util/redis');
const { v4: uuidv4 } = require('uuid');

var context = exports._context = {};

function key() {
  parts = Array.apply(null, arguments);
  parts.unshift(Config.get('session:store:namespace'));

  return parts.join(':');
}

exports.attach = function(app) {
  var client = context.client = Redis.connect();

  app.get('/session', function(req, res, next) {
    client.keys(key('*'),
      function(err, sessions) {
        if (err) return next(err);
        res.json(sessions);
      });
  });

  app.get('/session/:id', function(req, res, next) {
    var sessionKey = key(req.params.id);

    client.gets(sessionKey, function(err, session, state) {
      if (err) return next(err);
      if (!session) return res.status(404).json({
        success: false,
        retry: false,
        code: 'REQUEST.NOEXIST',
        message: 'The resource does not exist',
      });

      try { // Validate JSON
        session = JSON.parse(session);
      } catch (e) {
        return next(e);
      }

      // Keep the session from expiring mid-transaction
      client.expires(sessionKey,
        req.get('x-session-expire') || Config.get('session:expire'),
        function(err, updated, _, expire) {
          if (err) return next(err);

          res.set('x-session-id', req.params.id);
          res.set('x-session-state', state);
          res.set('x-session-expire', expire);
          res.json(session);
        });
    });
  });

  app.post('/session', function(req, res, next) {
    var id = uuidv4();

    client.sets(key(id), JSON.stringify(req.body),
      req.get('x-session-expire') || Config.get('session:expire'),
      function(err, created, state, expire) {
        if (err) return next(err);

        if (created) {
          res.set('x-session-id', id);
          res.set('x-session-state', state);
          res.set('x-session-expire', expire);

          return res.json(req.body);
        }

        res.status(409).json({
          success: false,
          retry: true,
          code: 'REQUEST.CONFLICT',
          message: 'A conflict exception occurred. Please try resubmitting the request',
        });
      });
  });

  app.put('/session/:id', function(req, res, next) {
    client.cas(key(req.params.id), JSON.stringify(req.body),
      req.get('x-session-state'),
      req.get('x-session-expire') || Config.get('session:expire'),
      function(err, updated, state, expire) {
        if (err) return next(err);

        if (updated) {
          res.set('x-session-id', req.params.id);
          res.set('x-session-state', state);
          res.set('x-session-expire', expire);

          return res.json({
            success: true,
          });
        }

        res.status(409).json({
          success: false,
          retry: false,
          code: 'REQUEST.CONFLICT',
          message: 'A conflict exception occurred. Please synchronize state and resubmit.',
        });
      });
  });

  app.delete('/session/:id', function(req, res, next) {
    client.dels(key(req.params.id), function(err, deleted) {
      if (err) return next(err);

      if (deleted) return res.json({
        success: true,
      });

      res.status(404).json({
        success: false,
        retry: false,
        code: 'REQUEST.NOEXIST',
        message: 'The resource does not exist',
      });
    });
  });
};

exports.close = function() {
  context.client.quit();
};
