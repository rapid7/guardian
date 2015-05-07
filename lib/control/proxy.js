var AuthN = require('./authn');
var AuthZ = require('./authz');
var HTTP = require('http');
var HTTPS = require('https');
var Path = require('path');
var QS = require('qs');
var URL = require('url');
var Util = require('util');

exports.attach = function(app, options) {
  options = options || {};

  app.use(AuthN.enforce);
  app.use(AuthZ.enforce);

  var upstream = (options.upstream instanceof Object) ?
    options.upstream :
    URL.parse(options.upstream);

  upstream = Util._extend({
    protocol: 'http',
    hostname: 'localhost',
    port: 80,
    pathname: '/'
  }, upstream);

  var downstream = (options.downstream instanceof Object) ?
    options.downstream :
    URL.parse(options.downstream);

  downstream = Util._extend({
    protocol: 'https',
    hostname: 'localhost',
    port: 443,
    pathname: '/'
  }, downstream);

  // Select HTTP or HTTPS
  var Protocol;
  switch (upstream.protocol) {
    case 'http:':
      Protocol = HTTP;
      break;
    case 'https:':
      Protocol = HTTPS;
      break;
    default:
      throw TypeError('Proxy target must be an HTTP or HTTPS service!');
  }

  // Construct an Agent
  upstream.agent = new Protocol.Agent(Util._extend({
    keepAlive: true,
    keepAliveMsecs: 5000,
    maxSockets: 32
  }, options.agent));

  // Attach controller
  app.use(function(req, res, next) {
    var options = Util._extend({}, upstream);
    options.method = req.method;
    options.path = Path.join(options.pathname, req.path);
    options.path += '?' + QS.stringify(req.query);

    options.headers = req.headers || {};
    options.headers.host = options.hostname;
    options.headers['x-forwarded-for'] = downstream.hostname;
    options.headers['x-forwarded-port'] = downstream.port;
    options.headers['x-forwarded-proto'] = downstream.protocol.slice(0, -1);

    req.log('PROXY_REQ', {
      method: options.method,
      path: options.path
    });

    var preq = Protocol.request(options, function(pres) {

      // Re-map location header to correct downstream
      if (pres.headers.location) {
        var location = URL.parse(pres.headers.location);


        if (location.hostname == upstream.hostname ||
          location.hostname === null) {

          location.protocol = downstream.protocol;

          location.hostname = downstream.hostname;
          delete location.host; // Shadows hostname/port in URL.format

          location.port = downstream.port;

          // Handle trailing slash redirects from pedantic web servers
          var slash = location.pathname[location.pathname.length - 1] == '/' ? '/' : '';

          location.pathname = Path.join(downstream.pathname,
            Path.relative(upstream.pathname, location.pathname), slash);

          pres.headers.location = URL.format(location);
        }
      }

      // No 301 redirects. Period.
      if (pres.statusCode == 301) pres.statusCode = 302;

      var log_params = {
        status: pres.statusCode,
      };

      if (pres.headers.location)
        log_params.location = pres.headers.location;
      req.log('PROXY_RES', log_params);

      res.status(pres.statusCode);
      res.set(pres.headers);
      pres.pipe(res);
    });

    preq.setNoDelay();
    preq.on('error', function(err) {
      next(err);
    });
    req.on('aborted', function() {
      preq.abort();
    });
    req.pipe(preq);
  });
};
