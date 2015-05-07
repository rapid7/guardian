var Accounting = require('../../model/accounting');

var AuthN = require('../authn');
var AuthZ = require('../authz');

var Body = require('../body');
var Express = require('express');
var QS = require('qs');

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
    var entity = Accounting.Authorization.byName(req.body.name);
    delete req.body.name;

    entity.update(req.body, function(err) {
      if (err) return next(err);

      if (req.accepts('html')) return res.redirect('/_manage/authorizations#' + entity.id);
      res.json(entity);
    });
  });

  router.post('/authorizations/:id', function(req, res, next) {
    new Accounting.Authorization(req.params.id).updateOrCreate(req.body, function(err, entity) {
      if (err) return next(err);

      if (req.accepts('html')) return res.redirect('/_manage/authorizations#' + entity.id);
      res.json(entity);
    });
  });

  function delete_authorization(req, res, next) {
    new Accounting.Authorization(req.params.id).findAndDelete(function(err, entity, deleted) {
      if (err) return next(err);
      var status = {
        action: 'delete',
        id: entity.id,
        name: entity.name,
        code: deleted ? 201 : 404,
        success: deleted
      };

      if (req.accepts('html')) return res.redirect('/_manage/authorizations?' + QS.stringify(status));
      res.status(status.code).json(status);
    });
  }
  router.delete('/authorizations/:id', delete_authorization);
  router.get('/authorizations/:id/delete', delete_authorization);

  router.get('/users', function(req, res, next) {
    Accounting.User.list(req.query.filter, function(err, entities) {
      if (err) return next(err);
      res.json(entities);
    });
  });

  router.get('/users/:id', function(req, res, next) {
    new Accounting.User(req.params.id).get(function(err, entity) {
      if (err) return next(err);
      res.json(entity);
    });
  });

  router.post('/users', function(req, res, next) {
    var entity = Accounting.User.byName(req.body.name);
    delete req.body.name;

    entity.update(req.body, function(err) {
      if (err) return next(err);

      if (req.accepts('html')) return res.redirect('/_manage/users#' + entity.id);
      res.json(entity);
    });
  });

  router.post('/users/:id', function(req, res, next) {
    new Accounting.User(req.params.id).updateOrCreate(req.body, function(err, entity) {
      if (err) return next(err);

      if (req.accepts('html')) return res.redirect('/_manage/users#' + entity.id);
      res.json(entity);
    });
  });

  function delete_user(req, res, next) {
    new Accounting.User(req.params.id).findAndDelete(function(err, entity, deleted) {
      if (err) return next(err);
      var status = {
        action: 'delete',
        id: entity.id,
        name: entity.name,
        code: deleted ? 201 : 404,
        success: deleted
      };

      if (req.accepts('html')) return res.redirect('/_manage/users?' + QS.stringify(status));
      res.status(status.code).json(status);
    });
  }
  router.delete('/users/:id', delete_user);
  router.get('/users/:id/delete', delete_user);

  app.use('/_accounting', router);
};
