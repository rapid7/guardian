var UUID = require('libuuid');

function stringify(value) {
  switch (value) {
    case undefined:
      return 'undefined';
    case null:
      return 'null';
    case true:
      return 'true';
    case false:
      return 'false';
    default:
      return value.toString();
  }
}

exports.attach = function(app, options) {
  options = options || {};
  if (!options.idHeader) options.idHeader = 'x-request-id';

  function log(event, params) {
    params = params || {};

    if (params instanceof Error) params = {
      error: params.type,
      message: params.message,
      stack: params.stack,
    };

    var message = Object.keys(params).map(function(key) {
      var value = stringify(params[key]).slice(0, 128);
      if (value.length == 128) value += ' ...';
      return key + '=' + value;
    });

    message.unshift(this.id);

    while (event.length < 12) event += ' ';
    message.unshift(event);

    var duration = ((Date.now() - this.started) / 1000) + '';
    while (duration.length < 6) duration += ' ';
    message.unshift(duration);

    console.log(message.join(' '));
  }

  app.use(function(req, res, next) {
    req.id = res.id = req.headers[options.idHeader] || UUID.create();
    res.set(options.idHeader, req.id);

    req.started = res.started = Date.now();
    req.log = res.log = log;

    req.log('REQUEST.BEGIN', {
      method: req.method,
      path: req.path,
      start: req.started / 1000,
    });

    res.before('headers', function() {
      var params = {
        status: res.statusCode,
      };

      if (res.getHeader('location'))
        params.location = res.getHeader('location');

      req.log('RESPONSE.BEGIN', params);
    });

    res.on('finish', function() {
      req.log('RESPONSE.END', {
        status: res.statusCode,
      });
    });

    next();
  });
};
