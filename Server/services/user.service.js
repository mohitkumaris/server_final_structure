var config = require('config.json');
var _ = require('lodash');
var jwt = require('jsonwebtoken');
var Q = require('q');
var bcrypt = require('bcryptjs');
var mongoUtil = require('../mongoPoolUtil');
var db = mongoUtil.getDb();
//db.bind('users');

var service = {};
service.authenticate = authenticate;
service.register = register;
service.getRoles = getRoles;
service.getOrganizations = getOrganizations;
service.getOrganizationsForRoles = getOrganizationsForRoles;
module.exports = service;


async function authenticate(username, password) {
    var deferred = Q.defer();
    db.collection("users").findOne({ email: username }, function (err, user) {
        if (err) deferred.reject(err.name + ': ' + err.message);

        if (user && bcrypt.compareSync(password, user.password)) {
            // authentication successful
            deferred.resolve({
                _id: user._id,
                email: user.email,
                first_name: user.first_name,
                last_name: user.last_name,
                token: jwt.sign({ sub: user._id }, config.secret)
            });

        } else {
            // authentication failed
            deferred.resolve();
        }
    });

    return deferred.promise;
}

async function register(req) {
    var user = req.body
    user.status = config.UnconfirmedUser;
    user.isIdentityCreated = false;
    var query = { "firstName": "abhi" };
    var db1 = mongoUtil.getDb();
    var database1=db1.collection("users");
    var result = await database1.find(query).toArray();
    if (result.length == 0) {
        user.password = await bcrypt.hash(user.password, 10)

        var error, response = await database1.insertOne(user);
        if (error) {
            // logger.debug('Error occurred while inserting');
            // logger.debug(error);
            return error;
        } else {
            // logger.debug('inserted record', response.ops[0]);
            return response.ops[0];
        }
    }
    else {
        return "user already exists"
    }
}


async function getRoles(req)
{
    var deferred = Q.defer();
    db.collection("roles").find({}, { _id: 0, Role_Name: 1, Title: 1 }).toArray(function (err, result) {
        if (err) throw err;
        deferred.resolve(result);
    });
    return deferred.promise;
}

async function getOrganizations(req)
{
    var deferred = Q.defer();  
    db.collection("organisation").find({}, { _id: 0, name: 1 }).toArray(function (err, result) {
        if (err) throw err;
        deferred.resolve(result);
    });
    return deferred.promise;
}

//TODO -  This method has been splited into above 2 methods. So, we can remove this
async function getOrganizationsForRoles(req) {
    var deferred = Q.defer();
    var data = {};
    data.roles = await service.getRoles();
    data.poNames = await service.getOrganizations();
    deferred.resolve(data);
    return deferred.promise;
}