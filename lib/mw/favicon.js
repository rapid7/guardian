/**
 * Load and serve a favicon
 */
var FS = require('fs');

exports.attach = function(app, path) {
  var content = FS.readFileSync(path);

  app.use('/favicon.ico', function(req, res) {
    res.send(content);
  });
};
