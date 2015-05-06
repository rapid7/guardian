var Accounting = require('../../model/accounting');
var AuthN = require('../authn');
var AuthZ = require('../authz');
var Body = require('../body');
var Express = require('express');

exports.attach = function(app) {
  var router = Express.Router();
  Body.attach(router);

  router.use(AuthN.enforce);
  router.use(AuthZ.enforce);

  router.get('/authorizations', function(req, res, next) {
    Accounting.Authorization.list(req.query.filter, function(err, entities) {
      if (err) return next(err);
      res.json(entities);
    });
  });

  router.get('/authorizations/:id', function(req, res, next) {
    new Accounting.Authorization(req.params.id).get(function(err, entities) {
      if (err) return next(err);
      res.json(entities);
    });
  });

  router.post('/authorizations', function(req, res, next) {
    var auth = Accounting.Authorization.byName(req.body.name);
    auth.update(req.body);
    auth.save(function(err, entities) {
      if (err) return next(err);
      res.json(entities);
    });
  });

  router.post('/authorizations/:id', function(req, res, next) {
    new Accounting.Authorization(req.params.id).updateOrCreate(req.body, function(err, entities) {
      if (err) return next(err);
      res.json(entities);
    });
  });

  router.get('/users', function(req, res, next) {
    Accounting.User.list(req.query.filter, function(err, entities) {
      if (err) return next(err);
      res.json(entities);
    });
  });

  router.get('/users/:id', function(req, res, next) {
    new Accounting.User(req.params.id).get(function(err, entities) {
      if (err) return next(err);
      res.json(entities);
    });
  });

  router.post('/users/:id', function(req, res, next) {
    new Accounting.User(req.params.id).updateOrCreate(req.body, function(err, entities) {
      if (err) return next(err);
      res.json(entities);
    });
  });

  app.use('/_accounting', router);
};
