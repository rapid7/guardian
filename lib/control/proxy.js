var AuthN = require('./authn');
var AuthZ = require('./authz');

var Misdirection = require('./proxy/misdirection');
var Moved2Found = require('./proxy/moved2found');
var ReqHeaders = require('./proxy/req-headers');
var Util = exports.Util = require('./proxy/util');

exports.attach = function(app, options) {
  app.use(AuthN.enforce);
  app.use(AuthZ.enforce);

  // Attach controller
  app.use(proxy(options));
};

function proxy(options) {
  options = Util.defaults(options, {
    rewriteLocation: true,
    rewriteMoved: true,
    noslash: false
  });

  // Thing that we're trying to proxy to
  var upstream = Util.endpoint(options.upstream, {
    protocol: 'http',
    hostname: 'localhost',
    port: 80,
    pathname: '/',
    noslash: options.noslash
  });

  // Select HTTP or HTTPS
  var Protocol = Util.selectProtocol(upstream.protocol);

  // Construct an Agent
  upstream.agent = new Protocol.Agent(Util.merge({
    keepAlive: true,
    keepAliveMsecs: 5000,
    maxSockets: 32
  }, options.agent));

  // Place clients are connecting to
  var frontend = Util.endpoint(options.frontend, {
    protocol: 'https',
    hostname: 'localhost',
    port: 443,
    pathname: '/',
    upstream_path: upstream.pathname
  });

  var misdirection = Misdirection(frontend);
  var moved2found = Moved2Found();
  var reqHeaders = ReqHeaders(frontend);

  return function(req, res, next) {
    var request = Util.request(req, upstream);
    reqHeaders(request, req.headers);

    var proxy = Protocol.request(request, function(response) {
      // Response rewriters
      if (options.rewriteLocation) misdirection(response);
      if (options.rewriteMoved) moved2found(response);

      res.status(response.statusCode);
      res.set(response.headers);

      req.log('PROXY_RES', { status: response.statusCode });
      response.pipe(res);
    });

    proxy.setNoDelay();
    proxy.on('error', function(err) {
      next(err);
    });
    req.on('aborted', function() {
      proxy.abort();
    });

    req.log('PROXY_REQ', { method: request.method, path: request.path });
    req.pipe(proxy);
  };
}
exports.create = proxy;
