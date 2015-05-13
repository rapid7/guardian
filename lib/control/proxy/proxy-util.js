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

function leftMerge(into, outof) {
  outof = outof || {};
  if (!(into instanceof Object)) return outof;

  Object.keys(outof).forEach(function(k) {
    if (!into.hasOwnProperty(k)) into[k] = outof[k];
  });

  return into;
}
exports.leftMerge = leftMerge;

function clone(parent) {
  parent = parent || {};
  var child = {};

  Object.keys(parent).forEach(function(k) {
    child[k] = parent[k];
  });

  return child;
}
exports.clone = clone;

exports.endpoint = function(options, defaults) {
  if (typeof options == 'string') options = URL.parse(options);
  leftMerge(options, defaults);

  // Remove trailing `:` from protocol string
  if (options.protocol[options.protocol.length - 1] == ':')
    options.protocol = options.protocol.slice(0, -1);

  delete options.host; // Shadows hostname/port
  return options;
};

exports.request = function(req, upstream) {
  var options = clone(upstream);

  options.method = req.method;
  options.path = Path.join(options.pathname, req.path);
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
