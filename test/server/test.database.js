const  env =  require('../../Server/config/config');
const  mongoose  = require('mongoose');

mongoose.connect(env.configuration.Connections.MongoDb);
mongoose.connection
    .once('open',()=>{
        console.log('connected with DB');
    })
    .on('error',(err)=>{ console.warn('ERR => ', err)});


beforeEach((done)=>{

   done();

});