(function(global, JQuery) {
  new View('#authorization-selector', '/_asset/app/view/authorization/selector.ejs', function(err, view) {
    if (err) return console.log(err);

    // Add click events
    JQuery('.authorization-selector-tab').click(function(e) {
      e.preventDefault();
      var selector = JQuery(this);

      window.location.hash = 'authorization=' + selector.attr('href').slice(1);
      selector.tab('show');
    });
  });

  new View('#authorization-content', '/_asset/app/view/authorization/content.ejs', function(err, view) {
    if (err) return console.log(err);

    // Activate selected tab on load
    JQuery('#tab-' + View.hash.authorization).tab('show');
  });
})(window, $);
