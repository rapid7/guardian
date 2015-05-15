/**
 * Rewrite request headers
 */
var Util = require('./util');

module.exports = function(options) {
  return function(proxy, downstream) {
    headers = downstream.headers || {};

    headers.host = options.upstream_host;
    headers['x-client-ip'] = downstream.ip;
    headers['x-forwarded-for'] = options.hostname;
    headers['x-forwarded-port'] = options.port;
    headers['x-forwarded-proto'] = options.protocol;

    Util.merge(proxy.headers, headers);
  };
};
