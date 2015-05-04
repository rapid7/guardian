var UUID = require('libuuid');

exports.attach = function(app) {
  app.use(function(req, res, next) {
    console.log(['REQ', req.id, req.path, req.session.id].join(' '));
    res.on('finish', function() {
      console.log(['RES', res.id, res.statusCode, res.getHeader('location')].join(' '));
    });

    next();
  });
};
