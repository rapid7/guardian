var AuthN = require('./authn');
var AuthZ = require('./authz');
var Path = require('path');
var URL = require('url');
var Util = require('util');

var Misdirection = require('./proxy/misdirection');
var Moved2Found = require('./proxy/moved2found');
var ReqHeaders = require('./proxy/req-headers');
var ProxyUtil = require('./proxy/proxy-util');

exports.attach = function(app, options) {
  options = options || {};

  app.use(AuthN.enforce);
  app.use(AuthZ.enforce);

  // Thing that we're trying to proxy to
  var upstream = ProxyUtil.endpoint(options.upstream, {
    protocol: 'http',
    hostname: 'localhost',
    port: 80,
    pathname: '/'
  });

  // Select HTTP or HTTPS
  var Protocol = ProxyUtil.selectProtocol(upstream.protocol);

  // Construct an Agent
  upstream.agent = new Protocol.Agent(ProxyUtil.merge({
    keepAlive: true,
    keepAliveMsecs: 5000,
    maxSockets: 32
  }, options.agent));

  // Place clients are connecting to
  var downstream = ProxyUtil.endpoint(options.downstream, {
    protocol: 'https',
    hostname: 'localhost',
    port: 443,
    pathname: '/',
    upstream_path: upstream.pathname
  });

  var misdirection = Misdirection(downstream);
  var moved2found = Moved2Found();
  var reqHeaders = ReqHeaders(downstream);

  // Attach controller
  app.use(function(req, res, next) {
    var request = ProxyUtil.request(req, upstream);
    reqHeaders(request, req.headers);

    var proxy = Protocol.request(request, function(response) {

        // Response rewriters
        misdirection(response);
        moved2found(response);

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
  });
};
