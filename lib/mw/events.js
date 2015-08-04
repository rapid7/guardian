var Response = require('express').response;
var _ = require('async');

exports.attach = function(app) {

  /**
   * res.before('headers', ...)
   *
   * `send` and `redirect` are the two primary entry
   * points from express
   */
  var _send = Response.send;
  var _redirect = Response.redirect;

  Response.send = function() {
    beforeHeaders.call(this, _send, arguments);
  };

  Response.redirect = function() {
    beforeHeaders.call(this, _redirect, arguments);
  };

  Response.beforeHeaders = beforeHeaders;

  function beforeHeaders(after, _arguments) {
    var _this = this; // Response scope
    _.eachSeries(this._before.headers,

      function(handler, next) {
        handler.call(_this, next);
      },

      function(err) { // Call the actual Response method
        if (after instanceof Function) after.apply(_this, _arguments);
      });
  }

  Response.before = function(hook, handler) {
    if (!this._before.hasOwnProperty(hook))
      throw ReferenceError(hook + ' is not a valid event');

    this._before[hook].push(handler);
  };

  app.use(function(req, res, next) {
    res._before = {
      headers: [],
    };

    next();
  });
};
