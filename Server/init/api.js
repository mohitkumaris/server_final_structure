const  express  = require('express'),
cors = require('cors'),
path  = require('path'),
morgan = require('morgan'),
    winston = require('./winston'),
    fs = require('fs'),
    _ = require('lodash'),
    moment = require('moment-timezone'),
    config = require('../config/config');
bodyparser  =  require('body-parser');
const app = function () {

  function App () {}

  App.prototype.start = function () {
    const appObject = express();
    appObject.use(bodyparser.json());
    appObject.use(express.json());
    appObject.use(express.urlencoded({extended: true}));

    appObject.options('*', cors());
    appObject.use(function (req, res, next) {
      res.header('Access-Control-Allow-Origin', '*');
      res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
      next();
    });


    return appObject;
  };

  App.prototype.listen = function (appObject, port) {

    appObject.listen(port, function () {
      console.log('Listening to  port ' + port);
    });
    return appObject;

  };
  App.prototype.registerRoutes = function (appObject) {

    const registerRoute=require('../modules/authentication/route');
    appObject.use('/api/' + registerRoute.path,registerRoute.protected,);
    appObject.use('/api/' + registerRoute.path, registerRoute.unprotected);


    /*
    //  Register ModulesRoute
    const registerRoute=require('../modules/registration/route');
    appObject.use('/api/' + registerRoute.path,registerRoute.guard,registerRoute.protected,);
    appObject.use('/api/' + registerRoute.path, registerRoute.unprotected);

    // services Route
    const commonRoute = require('../modules/common/routes');
    appObject.use('/api/' + commonRoute.path, commonRoute.protected);
    appObject.use('/api/' + commonRoute.path, commonRoute.unprotected);

    const vendorRoute = require('../modules/vendor/routes');
    appObject.use('/api/' + vendorRoute.path, vendorRoute.protected);
    appObject.use('/api/' + vendorRoute.path, vendorRoute.unprotected);
    */
  };

  App.prototype.enableLogger=function(appObject){
      const accessLogStream = fs.createWriteStream(
          path.join(__dirname, 'logs', 'access.log'),
          {flags: 'a'}
      );

      morgan.token('pid', (req, res) => {
          return _.get(req, 'session.user.pid') || 'Guest';
      });
      morgan.token('date', (req, res, tz) => {
          return moment().tz(tz).format();
      });
      // Intl.DateTimeFormat().resolvedOptions().timeZone;
      // Run the above command to know the exact timezone in node cmd.
      morgan.format('myformat', ':pid - [:date[' + config.configuration.ContinentCity + '] ":method :url" :status :res[content-length] - :response-time ms');
      appObject.use(morgan('myformat', {stream: winston.stream}))

  };

  App.prototype.OnError  = function(appObject){
    appObject.use(function(err, req, res, next) {

        winston.error(`${err.status || 500} - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`);
      // render the error page
      res.status(err.status || 500);
      res.render('error');
    });
  }

  let instance;

  return {
    getInstance: function () {
      if (null == instance) {
        instance = new App();
        instance.constructor = null; //  hiding  constructor to prevent instantiation
      }
      return instance;
    }
  };

}();

module.exports = app.getInstance();