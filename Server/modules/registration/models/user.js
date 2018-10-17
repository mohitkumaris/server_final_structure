'use strict';
const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const _ = require('lodash');
const bcrypt=require('bcryptjs');

var UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    trim: true,
    minlength: 1,
    unique: true,
    validate: {
      validator: validator.isEmail,
      message: '{VALUE} is not a valid email'
    }
  },
  password: {
    type: String,
    require: true,
    minlength: 6
  },
  tokens: [{
    access: {
      type: String,
      required: true
    },
    token: {
      type: String,
      required: true
    }
  }]
});
/*
 It's automatically called when we respond to
 the express request with res.send.
 That converts our object to a string by calling JSON.stringify.
 JSON.stringify is what calls toJSON. Here's an isolated example:
 It Overrides built in toJSON.
 */

/*
methods convert methods into model methods
 */
UserSchema.methods.toJSON = function () {
  var user = this;
  var userObject = user.toObject();

  return _.pick(userObject, ['_id', 'email']);
};

UserSchema.methods.generateAuthToken = function () {
  var user = this;
  var access = 'auth';
  var token = jwt.sign({_id: user._id.toHexString(), access}, 'abc123').toString();

  user.tokens.push({access, token});

  return user.save().then(() => {
    return token;
  });
};

UserSchema.methods.removeToken=function (token) {

  var user=this;

  return user.update(
    {
      $pull:{
        tokens:{token}
      }
    }
  )


};

/*
statics convert method into instance method

 "Static methods are meant to be relevant to all the instances of a class rather than
 to any specific instance." You use them pretty often,
 for example Date.now()  gives you the date without creating
 an instance of Date  like const date = new Date() .

So with this knowledge, we can conclude that "methods" are working
on the instance of a model. Example: generateAuthToken ;
 you want to generate the token for this specific user.
  Hence, user  is an instance of your model.
  But findByToken  cannot run on a specific user
  (because you only have one instance of user available
  and you cannot find another by token from there).
  You need to query for all Users , meaning you need
  to query all entries in your model,
not just a specific instance. Therefore, it is a static method.
 */

UserSchema.statics.findByToken=function (token) {
// Coz query is going to run over whole object
  //instead of instance
  var User=this;
  var decoded;
  try{
    decoded=jwt.verify(token,'abc123');
  }
  catch(e){

    return Promise.reject('Invalid Token');
  }

  return User.findOne({
    '_id':decoded._id,
    'tokens.access':'auth',
    'tokens.token':token
  });


};

UserSchema.statics.findByCredentials=function (email,password) {
  var User=this;
  return User.findOne({email})
    .then((user)=>{

      if(!user){
        return Promise.reject();
      }
      return new Promise((resolve,reject)=>{
        bcrypt.compare(password, user.password, function(err, res) {
          if(res) {
            resolve(user)

          }
          else{
            reject();
          }
        });
      });
    });
};

/*
Mongoose Middleware,
before saving hashing the password.
 */

UserSchema.pre('save',function (next) {
  var user = this;
  if(user.isModified('password')){

    bcrypt.genSalt(10,(err,salt)=> {

      bcrypt.hash(user.password, salt, (err, hash) => {

        user.password = hash;
        next();
      });
    });
  }
  else{
    next();
  }

})

var User = mongoose.model('User', UserSchema);

module.exports = {User}
