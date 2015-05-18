(function(global, JQuery) {
  function parseHash() {
    var hash_string = global.location.hash.slice(1);
    var hash = {};

    hash_string.split(/&/g).forEach(function(pair) {
      pair = pair.split('=');
      if (pair.length < 2) return;

      hash[pair[0]] = pair[1];
    });

    return hash;
  }

  function View(container, template, callback) {
    if(!(callback instanceof Function)) callback = function() {};
    var view = this;


    view.container = JQuery(container);
    view.variables = {};
    view.callback = callback;

    // Shallow clone of the model cache
    Object.keys(accounting.cache).forEach(function(key) {
      view.variables[key] = accounting.cache[key];
    });

    // Use cached template
    if(templates[template]) {
      view.template = templates[template];
      return callback(null, view);
    }

    JQuery.ajax(template, {
      method: 'GET',
      error: function(xhr, status, error) {
        if (typeof error == 'string') {
          error = new Error(error);
          error.status = status;
        }
        callback(error);
      },
      success: function(data, status, xhr) {
        view.template = templates[template] = ejs.compile(data);
        view.render();
      }
    });
  }

  View.prototype.render = function() {
    this.container.html(this.template(this.variables));
    this.callback(null, this);
  };

  var templates = View.templates = {};
  var hash = View.hash = parseHash();

  global.View = View;
})(window, $);
