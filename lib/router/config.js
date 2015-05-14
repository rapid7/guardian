var Config = global.Config = require('nconf');
var Path = require('path');

// Load arguments first
Config.argv({
  config: {
    alias: 'c',
    describe: 'Service configuration directory',
    'default': Path.resolve(__dirname, '../../conf')
  }
});

// Then use arguments to load additional files
var config = Path.join(Config.get('config'), 'router.json');
console.log('Loading service configuration from ' + config);
Config.file('site', config);

Config.defaults({
  service: {
    listen: './router.guardian.sock'
  },
  routes: {}
});
