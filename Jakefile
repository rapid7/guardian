require('./lib/config');

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

  Model.load('authorization');
  Model.load('user');
  Model.load('group');

  Model.sync({
    force: false,
  }).finally(function() {
    Model.close();
  });
}
