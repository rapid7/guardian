var HTTP = require('http');
var HTTPS = require('https');
var Path = require('path');
var QS = require('qs');
var URL = require('url');

function merge(into, outof) {
  outof = outof || {};
  if (!(into instanceof Object)) return outof;

  Object.keys(outof).forEach(function(k) {
    into[k] = outof[k];
  });

  return into;
}
exports.merge = merge;

function defaults(into, outof) {
  into = into || {};
  if (!(outof instanceof Object)) return into;

  Object.keys(outof).forEach(function(k) {
    if (!into.hasOwnProperty(k)) into[k] = outof[k];
  });

  return into;
}
exports.defaults = defaults;

function clone(parent) {
  parent = parent || {};
  var child = new parent.constructor;

  Object.keys(parent).forEach(function(k) {
    if(parent[k] instanceof Object) return (child[k] = clone(parent[k]));
    child[k] = parent[k];
  });

  return child;
}
exports.clone = clone;

exports.endpoint = function(options, d) {
  if (typeof options == 'string')
    options = URL.parse(options);

  options = defaults(options, d);

  // Remove trailing `:` from protocol string
  if (options.protocol[options.protocol.length - 1] == ':')
    options.protocol = options.protocol.slice(0, -1);

  delete options.host; // Shadows hostname/port
  delete options.path;
  return options;
};

exports.request = function(req, upstream, agent) {
  var options = clone(upstream);
  options.agent = agent;

  options.method = req.method;
  options.path = Path.join(options.pathname, req.path);

  // Remove trailing slash
  if(options.noslash && options.path[options.path.length - 1] == '/') {
    options.path = options.path.slice(0, -1);
  }

  if(req.query && Object.keys(req.query).length > 0)
    options.path += '?' + QS.stringify(req.query);

  // This is really a UNIX socket
  if(options.hasOwnProperty('socketPath')) {
    delete options.hostname;
    delete options.port;
  }

  options.protocol = options.protocol + ':';

  return options;
};

exports.selectProtocol = function(protocol) {
  switch (protocol) {
    case 'http:':
    case 'http':
      return HTTP;
    case 'https:':
    case 'https':
      return HTTPS;
    default:
      throw TypeError('Proxy target must be an HTTP or HTTPS service!');
  }
};
