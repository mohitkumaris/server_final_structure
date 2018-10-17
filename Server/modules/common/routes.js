const express  = require('express'),
SharedEnums = require('../common/sharedEnums'),
controller  = require('./controller/serviceController'),
ProtectedRoute =  express.Router(),
Route = express.Router();


Route.route('/City').get(controller.GetCity);
Route.route('/CompanyType').get(controller.GetCompanyType);
Route.route('/Services').get(controller.GetServices);
Route.route('/All').get(controller.GetAll);


module.exports = {
    protected: ProtectedRoute,
    unprotected: Route,
    path : SharedEnums.moduleRoute.COMMON
};