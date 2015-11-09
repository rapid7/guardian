var UUID = require('libuuid');
var Winston = require('winston');
require('winston-redis').Redis;

Winston.emitErrs = true;

var logger = new Winston.Logger({
  transports: [
    new Winston.transports.File({
      level: 'info',
      handleExceptions: true,
      json: true,
      filename: Config.get('logger:filename'),
      colorize: false
    }),
    new Winston.transports.Console({
      level: 'debug',
      handleExceptions: true,
      humanReadableUnhandledException: true,
      json: false,
      colorize: true,
      prettyPrint: true,
      timestamp: function() {
        return (new Date()).toISOString();
      }
    }),
    new Winston.transports.Redis({
      host: Config.get('session:store:host'),
      port: Config.get('session:store:port')
    })
  ],
  exitOnError: false
});

function stringify(value) {
  if(typeof value === 'undefined') {
    return 'undefined';
  }
  return JSON.stringify(value);
}

exports.attach = function(app, options) {
  options = options || {};
  if (!options.idHeader) options.idHeader = 'x-request-id';

  function log(event, params) {
    var type = 'info';
    params = params || {};

    if (params instanceof Error) {
      params = {
        error: params.type,
        message: params.message,
        stack: params.stack,
      };
      type = 'error';
    }

    params.id = this.id;
    params.duration = ((Date.now() - this.started) / 1000) + '';
    params.event = event;

    logger.log(type, event, params);
    // logger.log(type, '%s | %s', (new Date()).toISOString(), event, params);
  }

  app.use(function(req, res, next) {
    req.id = res.id = req.headers[options.idHeader] || UUID.create();
    res.set(options.idHeader, req.id);

    req.started = res.started = Date.now();
    req.log = res.log = log;

    req.log('request.begin', {
      method: req.method,
      path: req.path,
      start: req.started / 1000,
    });

    req.on('end', function() {
      req.log('request.end');
    });

    res.before('headers', function() {
      var params = {
        status: res.statusCode,
      };

      if (res.getHeader('location'))
        params.location = res.getHeader('location');

      req.log('response.begin', params);
    });

    res.on('finish', function() {
      req.log('response.end', {
        status: res.statusCode,
      });
    });

    next();
  });
};
