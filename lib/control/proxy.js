
exports.attach = function(app) {
  var proxy = require('http-proxy').createProxyServer(Config.get('proxy'));

  app.use(function(req, res, next) {
    proxy.web(req, res);
  });
};
