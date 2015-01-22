var proxy = require('http-proxy').createProxyServer(Config.get('proxy'));

exports.attach = function(app) {
  app.use(function(req, res, next) {
    proxy.web(req, res);
  });
};
