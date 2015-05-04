var UUID = require('libuuid');

exports.attach = function(app) {
  app.use(function(req, res, next) {
    req.id = res.id = UUID.create();
    next();
  });
};
