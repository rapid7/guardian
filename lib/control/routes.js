
exports.attach = function(app) {
  require('./routes/debug').attach(app);
  require('./routes/login').attach(app);
};
