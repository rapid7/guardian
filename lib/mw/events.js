
function wrapper(replace, before, scope) {
  return function() {
    // var _arguments = Array.apply(null, arguments);
    before.apply(scope, arguments);
    replace.apply(scope, arguments);
  };
}

exports.attach = function(app) {
  app.use(function(req, res, next) {
    // Emit 'headers' before headers are written
    res.writeHead = wrapper(res.writeHead, function(code, message, headers) {
      this.emit('headers');
    }, res);

    next();
  });
};
