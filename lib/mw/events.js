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
    before.call(this, 'headers', _send, arguments);
  };

  Response.redirect = function() {
    before.call(this, 'headers', _redirect, arguments);
  };

  function before(hook, after, _arguments) {
    var _this = this; // Response scope

    _.eachSeries(this._before[hook],

      function(handler, done) {
        if (handler.length === 0) { // Synchronous handler
          handler.call(_this);
          return done();
        }

        handler.call(_this, done);
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

  Response.notify = function(hook, callback, _arguments) {
    before.call(this, hook, callback, _arguments);
  };

  app.use(function(req, res, next) {
    res._before = {
      headers: [],
    };

    next();
  });
};
