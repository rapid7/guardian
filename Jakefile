require('./lib/config');

namespace('db', function() {
  desc('db:init', 'Initialize the Guardian SQL schema');
  task('init', function() {
    var Model = require('./lib/model');

    Model.load('authorization');
    Model.load('user');
    Model.load('group');

    Model.sync({
      force: true,
    }).finally(function() {
      Model.close();
    });
  });
});
