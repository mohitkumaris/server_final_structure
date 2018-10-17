const env = require('./Server/config/config') ,
database  =  require('./Server/init/database'),
app = require('./Server/init/api');



// Intializing Database
database.start(env.configuration.Connections.MongoDb);


//  Intializing App
var  appObject =  app.start();
app.registerRoutes(appObject);
app.listen(appObject,env.configuration.ListeningPort);