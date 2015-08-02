var QS = require('qs');

exports.attach = function(app) {
  app.use(aggregate);
  app.use(json);
  app.use(qs);
  app.use(plaintext);
};

exports.aggregate = function(app) {
  app.use(aggregate);
  return app;
};

function aggregate(req, res, next) {
  var chunks = [];
  req.body = {};

  req.on('data', function(data) { chunks.push(data); });

  req.on('end', function(data) {
    if (data) chunks.push(data);
    req.rawBody = Buffer.concat(chunks);
    next();
  });
}

exports.json = function(app) {
  app.use(json);
  return json;
};

function json(req, res, next) {
  if (!req.headers.hasOwnProperty('content-type') ||
    req.headers['content-type'].indexOf('application/json') < 0) return next();

  try {
    req.body = JSON.parse(req.rawBody.toString('utf8'));
  } catch (e) {
  }

  next();
}

exports.qs = function(app) {
  app.use(qs);
  return app;
};

function qs(req, res, next) {
  if (!req.headers.hasOwnProperty('content-type') ||
    req.headers['content-type'].indexOf('application/x-www-form-urlencoded') < 0) return next();

  try {
    req.body = QS.parse(req.rawBody.toString('utf8'));
    next();
  } catch (e) {
    next(e);
  }
};

exports.plaintext = function(app) {
  app.use(plaintext);
  return app;
};

function plaintext(req, res, next) {
  if (!req.headers.hasOwnProperty('content-type') ||
    req.headers['content-type'].indexOf('text/plain') < 0) return next();

  req.body = req.rawBody.toString('ascii');
  next();
}
