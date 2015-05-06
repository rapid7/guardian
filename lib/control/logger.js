var UUID = require('libuuid');

function stringify(value) {
  switch(value) {
    case undefined: return 'undefined';
    case null: return 'null';
    case true: return 'true';
    case false: return 'false';
    default: return value.toString();
  }
}

exports.attach = function(app) {
  function log(event, params) {
    params = params || {};

    var message = Object.keys(params).map(function(key) {
      var value = stringify(params[key]).slice(0, 128);
      if(value.length == 128) value += ' ...';
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
    req.id = res.id = UUID.create();
    req.started = res.started = Date.now();
    req.log = res.log = log;

    req.log('REQ', {
      method: req.method,
      path: req.path,
      start: req.started / 1000
    });

    res.on('finish', function() {
      var params = {
        status: res.statusCode,
      };

      if(res.getHeader('location'))
        params.location = res.getHeader('location');

      req.log('RES', params);
    });

    next();
  });
};
