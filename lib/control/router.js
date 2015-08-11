var Express = require('express');
var Proxy = require('../util/client/proxy');

var context = exports._context = {};

exports.attach = function(app) {
  var router = context.router = Express.Router();

  app.use(Config.get('router:prefix'), router);
  app.locals.prefix = Config.get('router:prefix');

  if (Config.get('router:status'))
    router.get('/status.json',
      function(req, res, next) {
        res.json({
          cookies: req.cookies,
          session: req.session,
          user: req.user,
        });
      });

  var routes = Config.get('router:routes');
  var downstream = Proxy.parseOptions(Config.get('router:downstream'));

  Object.keys(routes).forEach(function(path) {
    console.log('Router: Attaching route ' + path);
    var upstream = routes[path];
    upstream.downstream = Proxy.mergeOptions({
      pathname: path,
    }, downstream);

    var proxy = new Proxy(upstream);

    app.use(path, function(req, res, next) {
      proxy.request(req, res, next);
    });
  });
};
