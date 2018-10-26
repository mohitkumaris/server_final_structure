const assert  = require('assert');
const math = require('../../../../Server/modules/common/utility/Math');
const  UserLoginHandler  = require('../../../../Server/modules/authentication/handler/userLogin.Handler');

describe("User Login Handler",()=>{


    it("Check UserName Availability",(done)=>{
        var model  = {
            username :  math.RandomString() 
        }

        UserLoginHandler.CheckUserNameAvailability(model).then((response)=>{
            assert(response);
            done();
      }).catch((err)=>{
          assert(false);
          done();
      });
    });

    it("Register  New User",(done)=>{
             var randomName=math.RandomString();
            var  model  =  {
                username: randomName,
                password: 'sopra@123',
                fName: 'Mohit',
                lName: 'Kumar'
            };
            UserLoginHandler.RegisterNewUser(model).then((response)=>{
                  assert(response.username === model.username);
                  done();
            }).catch((err)=>{
                assert(false);
                done();
            });
        

    });

});