var Model = require('../model');

var Route = Model.requires('route');
var Statement = module.exports = new Model.Builder('Statement', {
  actions: {
    type: Model.DataTypes.TEXT,
    get: function() {
      return this.getDataValue('actions').split('\0');
    },

    set: function(actions) {
      this.setDataValue('actions', actions.join('\0'));
    },
  },
});

Statement.belongsTo(Route);
