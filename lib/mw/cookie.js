var CookieCodec = require('cookie');
var Util = require('util');

var Cookie = exports.Cookie = function(name, value, options) {
  this.name = name;
  this.value = value;
  this.options = options || {};
};

Cookie.prototype.serialize = function() {
  return CookieCodec.serialize(this.name, this.value, this.options);
};

// Add a cookie to the response
function setCookie(name, value, options) {
  this.cookies[name] = new Cookie(name, value, options);
}

// Get a cookie from the request. Decrypy if necessary
function getCookie(name) {
  return this.cookies[name];
}

// Set an exipry cookie
function rmCookie(name, options) {
  this.cookies[name] = new Cookie(name, 'destroyed', {
    secure: options.secure,
    httpOnly: options.httpOnly,
    maxAge: 0,
    path: options.path
  });
}

exports.attach = function(app) {
  app.use(function(req, res, next) {
    // Replace Express' methods
    res.cookie = setCookie;
    req.cookie = getCookie;
    res.rmCookie = rmCookie;

    // Add Set-Cookie headers before request ends
    res.cookies = {};
    res.on('headers', function() {
      this.setHeader('Set-Cookie', Object.keys(res.cookies).map(function(name) {
        return res.cookies[name].serialize();
      }));
    });

    // No request cookies. Carry on.
    if (!req.headers.cookie) {
      req.cookies = {};
      return next();
    }

    req.cookies = CookieCodec.parse(req.headers.cookie || '');

    next();
  });
};
