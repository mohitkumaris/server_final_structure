var appRoot = require('app-root-path');
var winston = require('Server/init/winston');

module.exports = {start: function()
{
  const {createLogger, format, transports} = winston
  const {combine, timestamp, label, printf, colorize, prettyPrint} = format
  const myFormat = printf(info => {
    return `${info.timestamp} [${info.label}] ${info.level}: ${info.message}`
  })

  var myModulePath = appRoot.resolve('/logs/app.log');
  console.log(myModulePath)

  var logger = winston.createLogger({
    format: combine(
      label({label: 'Syndication'}),
      colorize(), // Here is where the color happens
      timestamp(),
      myFormat
    ),
    transports: [
      new transports.Console({
        level: "debug",
        colorize: true,
        handleExceptions: true,
        humanReadableUnhandledException: true
      }),
      new transports.File({filename: myModulePath, level: 'info', colorize: true}),
      new transports.File({filename: myModulePath, colorize: true, level: 'debug', handleExceptions: true})
    ],
    exitOnError: false, // do not exit on handled exceptions
  });

// create a stream object with a 'write' function that will be used by `morgan`
  logger.stream = {
    write: function (message, encoding) {
      // use the 'info' log level so the output will be picked up by both transports (file and console)
      logger.info(message);
    },
  };

}
}

