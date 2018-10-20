const  mongoose  =require('mongoose');

const schema  = mongoose.Schema({

    username : {
        type : String,
        unique : true,
        require :  true,
        trim :  true
    },

    fName : {
      type : String,
      trim :  true
    },

    lName : {
      type : String,
      trim :  true
    },

    avator  : {
      type :  String,
      trim : true
    },

    password : {
        type : String,
        require :  true
    },

    changePassword : {
        type :  Boolean,
        default : false
    },

    status : {
        type  :  Number,
        require :  true
    },

    userType : {
        type : Number
    } ,


    loginDevices : [{
        deviceId : {
            type : Number
        },
        deviceInfo : {
            type : Object
        },
        token  :{
          type :  String
        },
        loginTym : {
            type :  Date
        }
    }],

});

const model  = mongoose.model('userLogin',schema);
module.exports =model;