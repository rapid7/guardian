var Config = global.Config = module.exports = require('nconf');
var Path = require('path');

// Load arguments first
Config.argv({
  config: {
    alias: 'c',
    describe: 'Service configuration directory',
    default: Path.resolve(__dirname, '../conf'),
  },
});

// Then use arguments to load additional files
Config.use('site', {
  type: 'file',
  file: Path.join(Config.get('config'), 'site.json'),
});

Config.service = function(name) {
  Config.use(name, {
    type: 'file',
    file: Path.join(Config.get('config'), name + '.json'),
  });

  return Config;
};

Config.complete = function() {
  Config.defaults({
    session: {
      service: {
        port: 9001,
        hostname: 'localhost',
      },
      store: {
        port: 6379,
        host: 'localhost',
        options: {},
        namespace: 'guardian:session',
      },
      expire: 3600,
      cookie: {
        name: 'guardian:session',
        options: {
          secure: false,
          httpOnly: true,
          maxAge: 3600,
          path: '/',
        },
      },
    },
    authn: {
      service: {
        port: 9002,
        hostname: '0.0.0.0',
      },
      status: true,
      prefix: '/_authn',
      providers: {},
    },
    authz: {
      service: {
        port: 9003,
        hostname: 'localhost',
      },
      status: true,
    },
    router: {
      service: {
        port: 9004,
        hostname: 'localhost',
      },
      status: true,
    },
    database: {
      name: 'guardian',
      user: 'guardian',
      password: 'guardian',
      options: {
        host: 'localhost',
        port: 3306,
        dialect: 'mysql',
        pool: {
          maxConnections: 16,
          minConnections: 2,
          maxIdleTime: 10000,
        },
      },
    },
  });

  return Config;
};
