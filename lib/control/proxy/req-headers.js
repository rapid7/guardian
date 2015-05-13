/**
 * Rewrite request headers
 */

module.exports = function(options) {

  return function(req, headers) {
    headers = headers || {};

    headers.host = options.upstream_host;
    headers['x-forwarded-for'] = options.hostname;
    headers['x-forwarded-port'] = options.port;
    headers['x-forwarded-proto'] = options.protocol;

    req.headers = headers;
  };
};
