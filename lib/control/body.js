var QS = require('qs');

exports.attach = function(app) {
  app.use(aggregate);
  app.use(json);
  app.use(qs);
  app.use(plaintext);
};

var aggregate = exports.aggregate = function(req, res, next) {
  var chunks = [];

  req.on('data', function(data) {
    chunks.push(data);
  });

  req.on('end', function(data) {
    if (data) chunks.push(data);
    req.rawBody = Buffer.concat(chunks);
    next();
  });
};

var json = exports.json = function(req, res, next) {
  if(!req.headers.hasOwnProperty('content-type') ||
    req.headers['content-type'].indexOf('application/json') < 0) return next();

  try {
    req.body = JSON.parse(req.rawBody.toString('utf8'));
    next();
  } catch(e) {
    next(e);
  }
};

var qs = exports.qs = function(req, res, next) {
  if(!req.headers.hasOwnProperty('content-type') ||
    req.headers['content-type'].indexOf('application/x-www-form-urlencoded') < 0) return next();

  try {
    req.body = QS.parse(req.rawBody.toString('utf8'));
    next();
  } catch(e) {
    next(e);
  }
};

var plaintext = exports.plaintext = function(req, res, next) {
  if(!req.headers.hasOwnProperty('content-type') ||
    req.headers['content-type'].indexOf('text/plain') < 0) return next();

  req.body = req.rawBody.toString('ascii');
  next();
};
