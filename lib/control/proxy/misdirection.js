/**
 * Handle incorrect location headers from upstreams.
 *
 * For now, this is going to naively rewrite everything to
 */
var Path = require('path');
var URL = require('url');

module.exports = function(options) {
  options = options || {};

  return function(res) {
    if(!res.headers.location) return;

    var location = URL.parse(res.headers.location);

    delete location.host; // Shadows hostname/port in URL.format()
    location.protocol = options.protocol;
    location.hostname = options.hostname;
    location.port = options.port;

    // Handle trailing slash redirects from pedantic web servers
    var slash = location.pathname[location.pathname.length - 1] == '/' ? '/' : '';
    var relative = Path.relative(options.upstream_path, location.pathname);
    location.pathname = Path.join(options.pathname, relative, slash);

    res.headers.location = URL.format(location);
  };
};
