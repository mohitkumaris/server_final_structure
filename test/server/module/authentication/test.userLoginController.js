let chai = require('chai');
let chaiHttp = require('chai-http');
let userController = require('../../../../Server/modules/authentication/controller/user.Controller');
let api = require('../../../../Server/init/api');
let should = chai.should();
chai.use(chaiHttp);
let expect = chai.expect;

describe('User Controller', () => {
    xit('should register', (done) => {
        let userName = {
            username: 'mkumar',
            password: 'sopra@123',
            fName: 'Mohit',
            lName: 'Kumar'
        };
        console.log(userController);
        chai.request(api)
            .post('/api/USER/Register')
            .send(userName)
            .end((err, res) => {
                console.log(res);
                console.log(err);

                done();
            });
    });
});