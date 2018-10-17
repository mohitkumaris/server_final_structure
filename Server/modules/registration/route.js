const express  = require('express'),
  SharedEnums = require('../common/sharedEnums'),
  ProtectedRoute =  express.Router(),
  Route = express.Router();
controller=require('./controller/controller')
guard:require('guard');

ProtectedRoute.route('/').post(controller.AddNewService);
ProtectedRoute.route('/').get(controller.GetAllService);
ProtectedRoute.route('/:serviceId').post(controller.AlterService);


module.exports = {
  protected: ProtectedRoute,
  unprotected: Route,
  path : SharedEnums.moduleRoute.SERVICES,
  guard:guard
};