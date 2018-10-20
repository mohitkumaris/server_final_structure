const env = require('./Server/config/config') ,
database  =  require('./Server/init/database'),
app = require('./Server/init/api');



// Intializing Database
database.start(env.configuration.Connections.MongoDb);

//  Intializing App
var  appObject =  app.start();

// Enable  Logging  
app.enableLogger(appObject);

//  Register Routes
app.registerRoutes(appObject);

//  Handling UnHandle Error  
app.OnError(appObject);

// Listerner
app.listen(appObject,env.configuration.ListeningPort);