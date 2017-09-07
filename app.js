var express = require('express');
var bodyparse = require('body-parser');
var session = require('express-session');
var path = require('path');
var cookieparser = require('cookie-parser');
var app = express();
var debug = require('debug')('weddr:server');
var http = require('http');
var mongoose = require('./config/mongoose.js');
var db = mongoose();
var port = normalizePort(process.env.PORT || '8080');
app.set('port', port);
console.log('Port ' + port);
var server = http.createServer(app);
server.listen(port);
server.on('error', onError);
server.on('listening', onListening);
function normalizePort(val) {
  var port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}
function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }
  var bind = typeof port === 'string'
    ? 'Pipe ' + port
    : 'Port ' + port;
  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening(req, res) {
  var addr = server.address();
  var bind = typeof addr === 'string'
    ? 'pipe ' + addr
    : 'port ' + addr.port;
  debug('Listening on ' + bind);
}
app.set('views',path.join(__dirname,'views'));
app.engine('.html',require('ejs').__express);
app.set('view engine', 'html');
app.use(bodyparse.json());
app.use(bodyparse.urlencoded({extended : true}));
app.use(cookieparser());
app.use(express.static(path.join(__dirname,'public')));

app.use(session({//
  secret: "weddr",
  key: "weddr",
  cookie: {maxAge: 10000 * 60 * 60 * 24 * 30},//
  saveUninitialized: true,
  resave: false,
}));


///////Change index to admin
require('./routes/route')(app);
app.use(function(req,res,next){
  // next();
  res.redirect('/index');
});
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

module.exports = app;
