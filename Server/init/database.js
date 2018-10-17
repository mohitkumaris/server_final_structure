var config = require('config.json');
var MongoClient = require('mongodb').MongoClient;
var _db;

module.exports = {

  Connect : function(app) {
    var db = MongoClient.connect(config.mongoConnection  , function (err, db) {
      if (!err) {
        console.log("Connected to : " + config.mongoConnection)
        const dbName = 'FrenchCustoms';
        _db = db.db(dbName);
        //app.set("mongodb", db);
        //console.log(db);
        //_db = db;
      } else {
        //logger.debug("Unable to connect to MongoDB: " + config.mongoConnection)
      }
    });

    return _db;
  },

  getDb: function() {
    return _db;
  },
  getMongo:function() {
    return mongo;
  }
};