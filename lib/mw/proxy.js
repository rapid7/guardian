/**
 * Create a proxy client for Express
 */
var Proxy = require('../util/client/proxy');

exports.attach = function(app, options) {
  var proxy = new Proxy(options);

  app.use(function(req, res, next) {
    proxy.request(req, res, next);
  });
};
