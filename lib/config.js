var Config = global.Config = require('nconf');
var Path = require('path');

// Load arguments first
Config.argv({
  config: {
    alias: 'c',
    describe: 'Service configuration directory',
    'default': Path.resolve(__dirname, '../conf')
  }
});

// Then use arguments to load additional files
Config.file('site', Path.join(Config.get('config'), 'site.json'));
Config.file('chef', Path.join(Config.get('config'), 'chef.json'));

Config.defaults({
  strategy: {
    provider: 'SAML',
    certificate: Path.join(Config.get('config'), 'certificate.pem'),
    params: {}
  },
  service: {
    domain: {
      protocol: 'http',
      hostname: 'localhost',
      port: 8080
    },
    socket: './guardian.downstream.sock',
    listen: 'socket',
    store: {
      host: 'http://localhost:2379'
    }
  },
  session: {
    name: 'guardian.session',
    maxAge: 3600
  },
  cookie: {
    secure: true,
    httpOnly: true
  },
  proxy: {
    target: './guardian.upstream.sock'
  }
});
