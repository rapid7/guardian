var Model = require('../model');

var Action = Model.requires('action');
var Service = Model.requires('service');
var Route = module.exports = new Model.Builder('Route', {
  path: Model.DataTypes.STRING(1024),
  methods: {
    type: Model.DataTypes.TEXT,
    get: function() {
      return this.getDataValue('actions').split('\0');
    },

    set: function(actions) {
      this.setDataValue('actions', actions.join('\0'));
    },
  },
});

Route.belongsTo(Action);
Action.hasMany(Route);

Route.belongsTo(Service);
Service.hasMany(Route);
