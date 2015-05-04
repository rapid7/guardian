var AuthN = require('./authn');
var AuthZ = require('./authz');
var HTTPProxy = require('http-proxy');

exports.attach = function(app) {
  console.log('Proxying requests to ' + Config.get('proxy:target'));
  var proxy = HTTPProxy.createProxyServer(Config.get('proxy'));

  app.use(AuthN.enforce);
  app.use(AuthZ.enforce);

  app.use(function(req, res, next) {
    proxy.web(req, res, next);
  });
};
