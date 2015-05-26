var Accounting = require('../../model/accounting');
var Session = require('../../model/session');

var AuthN = require('../authn');
var AuthZ = require('../authz');

var Express = require('express');
var Static = require('serve-static');
var FS = require('fs');
var Path = require('path');

exports.attach = function(app) {
  var router = Express.Router();

  router.use(AuthN.enforce);
  router.use(AuthZ.enforce);

  router.get('/', function(req, res, next) {
      Session.list(function(err, sessions) {
        if (err) return next(err);

        Object.keys(sessions).forEach(function(key) {
          sessions[key].expires = sessions[key].__expires;
        });

        res.render('index.ejs', {
          sessions: sessions
        });
      });
  });

  router.get('/authorizations', function(req, res, next) {
    Accounting.Authorization.list(function(err, authorizations) {
      if(err) return next(err);
      Accounting.User.list(function(err, users) {
        if(err) return next(err);
        res.render('authorizations.ejs', {
          users: users,
          authorizations: authorizations
        });
      });
    });
  });

  router.get('/users', function(req, res, next) {
    Accounting.Authorization.list(function(err, authorizations) {
      if(err) return next(err);
      Accounting.User.list(function(err, users) {
        if(err) return next(err);
        res.render('users.ejs', {
          users: users,
          authorizations: authorizations
        });
      });
    });
  });

  app.use('/_manage', router);
  app.use('/_asset', Static(Path.resolve(__dirname, '../../../asset')));

  var favicon = FS.readFileSync(Path.resolve(__dirname, '../../../asset/favicon.ico'));
  app.get('/favicon.ico', function(req, res) {
    res.type('ico').send(favicon);
  });
};
