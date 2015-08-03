/**
 * Proxy client
 */
var Client = require('../client');
var Path = require('path');
var URL = require('url');

var Proxy = module.exports = function(options) {
  this.rewriteStatus = options.hasOwnProperty('rewriteStatus') ? !!options.rewriteStatus : true;
  delete options.rewriteStatus;

  this.rewriteLocation = options.hasOwnProperty('rewriteLocation') ? !!options.rewriteLocation : true;
  delete options.rewriteLocation;

  this.downstream = Client.parseOptions(options.downstream);
  delete options.downstream;

  Client.call(this, options);
  this.upstream = this.options;
};

Client.extend(Proxy);

Proxy.prototype.request = function(req, res, next) {
  var _this = this;

  var preq = Proxy.request(req.method, Client.mergeOptions({
    pathname: reqPath.call(this, req.path),
    query: req.query,
    headers: reqHeaders.call(this, req),
  }, this.options));

  preq.setNoDelay();

  preq.on('error', function(err) {
    next(err);
  });

  preq.on('response', function(pres) {
    res.status(resStatus.call(_this, pres.statusCode));
    res.set(resHeaders.call(_this, pres.headers));

    pres.pipe(res);
  });

  req.on('aborted', function() {
    preq.abort();
  });

  req.pipe(preq);
};

/**
 * Rewrite request path before sending to upstream
 */
function reqPath(path) {
  return Path.join(this.upstream.pathname, path);
}

/**
 * Rewrite request headers before sending to upstream
 */
function reqHeaders(req) {
  req.headers.host = this.upstream.hostname;
  req.headers['x-client-ip'] = req.get('x-client-ip') || req.ip;

  req.headers['x-forwarded-for'] = this.downstream.hostname ||
    req.get('x-forwarded-for') || req.hostname;

  req.headers['x-forwarded-port'] = this.downstream.port ||
    req.get('x-forwarded-port') || req.socket.localPort;

  req.headers['x-forwarded-proto'] = this.downstream.protocol ||
    req.get('x-forwarded-proto') || req.protocol;

  return req.headers;
}

/**
 * Rewrite response status from upstream
 */
function resStatus(status) {
  if (!this.rewriteStatus) return status;

  if (status == 301) return 302; // Moved -> Found. Keep browsers from caching.

  return status;
}

/**
 * Rewrite response headers before sending to client
 */
function resHeaders(headers) {
  if (!headers.hasOwnProperty('content-length') &&
    !headers.hasOwnProperty('transfer-encoding'))
    headers['transfer-encoding'] = 'chunked';

  if (headers.location)
    headers.location = resLocation.call(this, headers.location);

  return headers;
}

/**
 * Re-write Location headers from upstream services
 */
function resLocation(location) {
  if (!this.rewriteLocation) return location;

  location = URL.parse(location);
  Client.parseOptions(location);

  location.hostname = this.downstream.hostname;
  location.port = this.downstream.port;

  // Handle trailing-slash paths
  var trailingSlash = location.pathname.slice(-1) == '/' ? '/' : '';

  location.pathname = Path.relative(this.upstream.pathname, location.pathname);
  location.pathname = Path.join(
    this.downstream.pathname,
    location.pathname,
    trailingSlash
  );

  return URL.foramt(location);
}
