(function(global, JQuery) {
  new View('#user-selector', '/_asset/app/view/user/selector.ejs', function(err, view) {
    if (err) return console.log(err);

    // Add click events
    JQuery('.user-selector-tab').click(function(e) {
      e.preventDefault();
      var selector = JQuery(this);

      window.location.hash = 'user=' + selector.attr('href').slice(1);
      selector.tab('show');
    });
  });

  new View('#user-content', '/_asset/app/view/user/content.ejs', function(err, view) {
    if (err) return console.log(err);

    // Activate selected tab on load
    JQuery('#tab-' + View.hash.user).tab('show');

    // Remove Authorizatrion control
    JQuery('.authorization-remove').click(function(e) {
      e.preventDefault();
      var remove = JQuery(this);

      var user = accounting.user(remove.attr('data-user'));
      if (!user) return;

      // Find authorizations to delete
      var i = user.authorizations.indexOf(remove.attr('data-auth'));
      if (i < 0) return;

      user.authorizations.splice(i, 1);
      user.update(function(err) {
        if (err) return console.log(err);

        // Re-render with updated user
        view.render();
      });
    });

    JQuery('.authorization-add').click(function(e) {
      e.preventDefault();
      var add = JQuery(this);

      var user = accounting.user(add.attr('data-user'));
      if (!user) return;

      user.authorizations.push(add.attr('data-auth'));
      user.update(function(err) {
        if (err) return console.log(err);

        // Re-render with updated user
        view.render();
      });
    });
  });
})(window, $);
