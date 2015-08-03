/**
 * The HTTP/S client core used throughout Guardian
 */
var HTTP = require('http');
var HTTPS = require('https');
var Path = require('path');
var QS = require('qs');
var URL = require('url');
var Util = require('util');

/**
 * Streaming wrapper for Core HTTP/S Client
 */
var Client = module.exports = function(options) {
  this.options = mergeOptions(parseOptions(options), DEFAULTS);
  this.options.agent = this.agent = agent(this.options);
};

Client.prototype.request = function(method, options, callback) {
  return Client.request(method,
    mergeOptions(options, this.options), callback);
};

Client.extend = function(child) {
  Util.inherits(child, this);
  child.__proto__ = this;
};

Client.request = function(method, options, callback) {
  options = parseOptions(options);
  mergeOptions(options, DEFAULTS);

  options.method = method;
  options.path = options.pathname;
  if (options.query) options.path += '?' + QS.stringify(options.query);

  var req = protocol(options).request(options);
  req.on('response', function(res) {
    if (callback instanceof Function) return callback(res);

    // Emit the status code (e.g. 404, 4xx)
    req.emit('' + res.statusCode, res);
    req.emit(('' + res.statusCode)[0] + 'xx', res);
  });

  return req;
};

var METHODS = Client.METHODS = HTTP.METHODS;
var DEFAULTS = Client.DEFAULTS = {
  protocol: 'http:',
  hostname: 'localhost',
  port: 80,
  pathname: '/',
  query: null,
  headers: {},
  keepAlive: true,
  keepAliveMsecs: 10000,
};

/**
 * JSON wrapper for the streaming client
 */
var JSONClient = Client.JSON = function(options) {
  Client.call(this, options);
};

Client.extend(JSONClient);

JSONClient.prototype.request = function(method, options, data, callback) {
  return JSONClient.request(method,
    mergeOptions(options, this.options),
    data, callback);
};

JSONClient.request = function(method, options, data, callback) {
  options = parseOptions(options);

  var payload = null;
  if (data instanceof Function) {
    callback = data;
  } else {
    payload = Buffer(JSON.stringify(data), 'utf8');
  }

  // Set JSON headers
  if (payload) {
    options.headers['content-type'] = 'application/json';
    options.headers['content-length'] = payload.length;
  }

  options.headers.accept = 'application/json';

  // Use the streaming client. Aggregate response chunks and try to
  // decode JSON.
  var req = this.super_.request(method, options, function(res) {
    var chunks = [];
    res.on('end', function(d) {
      if (d) chunks.push(d);
      var data = Buffer.concat(chunks).toString('utf8');

      try {
        callback(null, JSON.parse(data), res);
      } catch (e) {
        callback(e);
      }
    });

    res.on('data', function(d) {
      chunks.push(d);
    });
  });

  req.on('error', function(e) {
    callback(e);
  });

  // Send request data and end request
  if (payload) req.write(payload);
  req.end();

  return req;
};

/**
 * Attach supported HTTP methods to Client and JSONClient
 */
METHODS.forEach(function(method) {
  var methodName = method.toLowerCase();

  Client[methodName] =
    Client.prototype[methodName] =
    function(options, callback) {
      return this.request(method, options, callback);
    };

  JSONClient[methodName] =
    JSONClient.prototype[methodName] =
    function(options, data, callback) {
      return this.request(method, options, data, callback);
    };
});

/**
 * Helpers
 */
function protocol(options) {
  switch (options.protocol) {
    case 'http:':
    case 'http':
      return HTTP;
    case 'https:':
    case 'https':
      return HTTPS;
    default:
      throw TypeError('Protocol must be `http` or `https`!');
  }
}

function agent(options) {
  return new(protocol(options).Agent)(options);
}

function parseOptions(options) {
  options = options || {};
  if (typeof options == 'string') options = URL.parse(options);

  delete options.host;
  delete options.path;
  delete options.search;
  if (!(options.headers instanceof Object)) options.headers = {};
  if (typeof options.query == 'string') options.query = QS.parse(options.query);

  return options;
}

function mergeOptions(target, defaults) {
  target = target || {};
  if (!defaults) return target;

  Object.keys(defaults).forEach(function(k) {
    if (target.hasOwnProperty(k)) return;
    if (k == 'headers') return;
    if (k == 'pathname') return;
    if (k == 'query') return;

    target[k] = defaults[k];
  });

  Object.keys(defaults.headers).forEach(function(k) {
    if (target.headers.hasOwnProperty(k)) return;
    target.headers[k] = defaults.headers[k];
  });

  target.pathname = Path.join(defaults.pathname, target.pathname || '/');
  mergeOptions(target.query, defaults.query);

  return target;
}

Client.parseOptions = parseOptions;
Client.mergeOptions = mergeOptions;
