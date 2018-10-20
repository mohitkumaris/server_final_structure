const express  = require('express'),
  SharedEnums = require('../common/sharedEnums'),
  ProtectedRoute =  express.Router(),
  Route = express.Router();
controller=require('./controller/user.Controller');

Route.route('/CheckUserNameAvailability').post(controller.CheckUserNameAvailability);
Route.route('/Register').post(controller.RegisterNewUser);


module.exports = {
  protected: ProtectedRoute,
  unprotected: Route,
  path : SharedEnums.moduleRoute.User,
  guard:{}
};