const  mongoose  = require('mongoose');

module.exports = {
  start :  function(connectionstring){
    mongoose.connect(connectionstring);
    mongoose.connection
      .once('open',()=>{console.log('connected with DB');})
      .on('error',(err)=>{ console.warn('ERR => ', err)});
  }

};