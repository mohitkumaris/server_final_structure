module.exports  = {
    status : {
 
    } ,
    errorType : {
        "VALIDATION"  : "ValidationError"

    },
    configuration: {
        "OTPLENGTH" : 4
    },
    responseCode  : {
        "SUCCESS" :  200,
        "CREATED" :  201,
        "BADREQUEST" : 400,
        "SERVERERROR" : 500,
        "UNAUTHORIZE" : 401,
        "NOTFOUND" : 404
    },
    moduleRoute  : {
        "SERVICES" : 'service',
        "VENDOR" : 'vendor',
        "COMMON" :  'common'
    },

    userType  : {
        Vendor : 1
    },
    vendorStatus : {
      "REGISTEREDBUTOTPNOTVERIFIED" : 1,
      "ASKFORPASSWORD" : 2,
      "INFOREQUIRED" : 3,
      "ACTIVE" : 4,
      "INACTIVE" :  5,
      "ACTIVEBUTNOBOOKING" : 6    
    },
    vendorStepCreationStep  :  [
      {  "STEP" : "REGISTER" , "STATUS" : 0,  REQUIRE : true, ORDER : 0 },
        {"STEP" : "OTP", "STATUS" : 1 ,  REQUIRE :  true , ORDER : 1},
         {"STEP"  : "SETPASSWORD" , STATUS : 2, REQUIRE : true, ORDER : 2 },
       { "STEP" : "INFORMATION" , STATUS :  3,  REQUIRE :  false, ORDER :  3 }
    ],
    errorMesaageCode  : {
        "EService01" : "EService01", // Service  name is  not correct
        "EService02" : "EService02", // Serice  name is  not unique
        "EService03" : "EService03", // Service Id not  found ,
        "EServiveGET" : "EServiceGET", // Error While Getting  Service  From Database
        "ELoginUserNotFound" : "ELoginUserNotFound",
        "ELoginUserDisable" : "ELoginUserDisable",
        "ELoginPasswordNotMatch" : "ELoginPasswordNotMatch",
        "EUsernameAlreadyExist": "EUsernameAlreadyExist", 
        "EUserCreatedFailed" : "EUserCreatedFailed",
        "EOTPUnableToGenerate" : "EOTPUnableToGenerate",
        "EInValidOtp" : "EInValidOtp"

    }

}