const env  = require('./env.json');

module.exports = {
    //  In CASE of Prod  change below 
    configuration :   env.ENV['DEV'] 
}