
exports.attach = function(app) {
  require('./routes/accounting').attach(app);
  require('./routes/manage').attach(app);
  require('./routes/status').attach(app);
};
