var Config = global.Config = require('nconf');
var Path = require('path');

Config.file(Path.resolve(__dirname, '../config/site.json'));
Config.defaults({
  provider: {
    issuer: 'http://localhost',
    path: '/login/callback',
    entryPoint: '/',
    identifierFormat: 'urn:oasis:names:tc:SAML:2.0:nameid-format:emailAddress',
    certificate: Path.resolve(__dirname, '../config/certificate.pem')
  },
  service: {
    domain: 'localhost',
    socket: './guardian.sock',
    listen: 'socket'
  },
  session: {
    name: 'guardian.session',
    expire: 3600,
    secret: 'Hey! This is still the default session secret! Change it in config/site.json!',
    cookie: {
      secure: true,
      secret: 'Hey! This is still the default cookie secret! Change it in config/site.json!',
      httpOnly: true
    }
  },
  proxy: {
    target: 'http://localhost:8888/'
  }
});
