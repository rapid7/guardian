/**
 * Rewrite all 301 responses to 302
 *
 * Don't let upstreams generate cachable redirects. Browsers don't
 * handle 301 responses determinsitcly. Responses are cached transparently
 * for unkonwn periods of time with poor eviction controls.
 */
module.exports = function(options) {
  return function(res) {
    if(res.statusCode == 301) res.statusCode = 302;
  };
};
