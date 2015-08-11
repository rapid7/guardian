require('./lib/config').complete();

namespace('db', function() {
  desc('db:init', 'Initialize the Guardian SQL schema');
  task('init', function() {
    dbInit(false);
  });

  desc('db:replace', 'Replace the Guardian SQL schema');
  task('replace', function() {
    dbInit(true);
  });
});

function dbInit(force) {
  var Model = require('./lib/model');

  Model.load('user');
  Model.load('policy');
  Model.load('service');

  Model.sync({
    force: !!force,
  }).finally(function() {
    Model.close();
  });
}
