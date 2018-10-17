require('rootpath')();
var express = require('express');
var app = express();
var cors = require('cors');
var helmet = require('helmet')
var bodyParser = require('body-parser');
var expressJwt = require('express-jwt');
var config = require('config.json');
const logger = require('./winston')
var mongoUtil = require('mongoPoolUtil');

app.options('*', cors());
app.use(cors());
app.use(helmet());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: false
}));

//connect to mongoDB
mongoUtil.connectToMongoServer(app);

app.use('/apis', require('./routes/routes.js'));

// error handler
app.use(function (err, req, res, next) {
    if (err.name === 'UnauthorizedError') {
        res.status(401).send('Invalid Token');
    } else {
        throw err;
    }
});
// start server
var port = process.env.NODE_ENV === 'production' ? 80 : 4000;
var server = app.listen(port, function () {
    console.log('Server listening on port ' + port);
});