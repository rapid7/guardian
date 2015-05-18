(function(global, JQuery) {
  function Accounting() {
    this.cache = {
      authorizations: {},
      users: {}
    };
  }

  Accounting.prototype.authorization = function(id, data) {
    if (data) this.cache.authorizations[id] = Authorization.create(id, data);
    return this.cache.authorizations[id];
  };

  Accounting.prototype.user = function(id, data) {
    if (data) this.cache.users[id] = User.create(id, data);
    return this.cache.users[id];
  };

  Accounting.prototype.each = function(node, iterator) {
    if (!(this.cache[node] instanceof Object)) return;
    var cache = this.cache[node];

    Object.keys(cache).forEach(function(key) {
      iterator(key, cache[key]);
    });
  };

  Accounting.prototype.search = function(node, query) {
    if (!(this.cache[node] instanceof Object)) return;
    var cache = this.cache[node];
    query = query.toLowerCase();

    return Object.keys(cache).filter(function(key) {
      var entity = cache[key];

      // Search string attributes
      return Object.keys(entity).filter(function(attr) {
        return (typeof entity[attr] == 'string');
      }).map(function(attr) {
        return entity[attr].toLowerCase().indexOf(query) >= 0;
      }).reduce(function(a, b) {
        return a || b;
      });

    }).map(function(key) {
      return cache[key];
    });
  };

  function set_default(key, value) {
    if (!this.hasOwnProperty(key)) this[key] = value;
  }

  function Authorization() {
    set_default.call(this, 'id', '');
    set_default.call(this, 'name', '');
    set_default.call(this, 'statements', []);
  }

  Authorization.create = function(id, data) {
    Authorization.call(data);
    data.id = id;
    data.__proto__ = Authorization.prototype; // jshint ignore:line

    return data;
  };

  Authorization.prototype.save = function(callback) {
    JQuery.ajax('/_accounting/authorizations/' + this.id, {
      accepts: 'application/json',
      contentType: 'application/json',
      data: this,
      dataType: 'json',
      method: 'POST',
      error: function(xhr, status, error) {
        if (typeof error == 'string') {
          error = new Error(error);
          error.status = status;
        }
        callback(error);
      },
      success: function(data, status, xhr) {
        callback(null, data);
      }
    });
  };

  function User() {
    set_default.call(this, 'id', '');
    set_default.call(this, 'name', '');
    set_default.call(this, 'profile', {});
    set_default.call(this, 'providers', {});
    set_default.call(this, 'authorizations', []);
    set_default.call(this, 'groups', []);
  }

  User.create = function(id, data) {
    User.call(data);
    data.id = id;
    data.__proto__ = User.prototype; // jshint ignore:line

    return data;
  };

  User.prototype.update = function(callback) {
    JQuery.ajax('/_accounting/users/' + this.id, {
      accepts: 'application/json',
      contentType: 'application/json',
      data: JSON.stringify(this),
      dataType: 'json',
      method: 'POST',
      error: function(xhr, status, error) {
        if (typeof error == 'string') {
          error = new Error(error);
          error.status = status;
        }
        callback(error);
      },
      success: function(data, status, xhr) {
        callback(null, data);
      }
    });
  };

  // Entities
  global.Authorization = Authorization;
  global.User = User;

  // Controllers
  global.accounting = new Accounting();
})(window, $);
