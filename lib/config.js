var Config = global.Config = require('nconf');
var Path = require('path');

Config.file(Path.resolve(__dirname, '../config/site.json'));
Config.defaults({
  strategy: {
    provider: 'SAML',
    certificate: Path.resolve(__dirname, '../config/certificate.pem'),
    params: {}
  },
  service: {
    domain: {
      protocol: 'http',
      hostname: 'localhost',
      port: 8080
    },
    socket: './guardian.sock',
    listen: 'socket'
  },
  session: {
    name: 'guardian.session',
    expire: 3600,
    secret: 'Hey! This is still the default session secret! Change it in config/site.json!',
    cookie: {
      secure: true,
      httpOnly: true
    },
    store: {
      hostname: '127.0.0.1',
      port: 6379
    }
  },
  proxy: {
    target: 'http://localhost:8888/'
  }
});
