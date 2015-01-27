var Express = require('express');
var FS = require('fs');
var HTTP = require('http');
require('../lib/config');

var Auth = require('../lib/control/auth');
var BodyParser = require('body-parser');
var CookieParser = require('cookie-parser');
var Session = require('express-session');

var app = Express();
var server = HTTP.createServer(app);

app.use(CookieParser());
app.use(BodyParser.json());
app.use(BodyParser.urlencoded({
  extended: true
}));
app.use(Session({
  name: Config.get('session:name'),
  cookie: {
    secure: Config.get('session:cookie:secure'),
    httpOnly: Config.get('session:cookie:httpOnly'),
    maxAge: Config.get('session:expire') * 1000
  },
  rolling: true,
  resave: true,
  saveUninitialized: true,
  secret: Config.get('session:secret')
}));

Auth.attach(app);
require('../lib/control/login').attach(app);
require('../lib/control/debug').attach(app);
Auth.enforce(app);
require('../lib/control/proxy').attach(app);

if (Config.get('service:listen') != 'socket')
  return server.listen(Config.get('service:listen'), function() {
    console.log('Listening on TCP port ' + Config.get('service:listen'));
  });

try {
  FS.unlinkSync(Config.get('service:socket'));
} catch(e) {}
server.listen(Config.get('service:socket'), function() {
  console.log('Listening on UNIX socket ' + Config.get('service:socket'));
});
