'use strict';
const bcrypt = require('bcrypt');
const
    User = {},
    logger = require('../../winston');    

User.register = register;
User.getDetails = getDetails;

async function register(db, user) {
   
    console.log(user.Username);
    var query = { "Username": user.Username};
    var result     

   var result =await  db.collection("users").find(query).toArray()       
    if(result.length ==0){
    user.password= await bcrypt.hash(user.password, 10)  
   var error, response = await db.collection('users').insertOne(user);
    if (error) {
        logger.debug('Error occurred while inserting');
        logger.debug(error);
        return error;
    } else {
        logger.debug('inserted record', response.ops[0]);
        return response.ops[0];
    }
}
else{
    return "user already exists"
}
}



async function getDetails(db, user) {    
    var query = { "Username": user.Username};
    var result =await  db.collection("users").find(query).toArray()      
     return result
}


module.exports = User;