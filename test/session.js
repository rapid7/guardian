require('../lib/config');

var Session = require('../lib/util/client/session');
Session.connect();

global.session = {
  find: function(id) {
    var _this = this;

    Session.find(id, function(err, s) {
      if (err) return console.log(err);

      _this._ = s;
      console.log(s);
    });
  },
};
