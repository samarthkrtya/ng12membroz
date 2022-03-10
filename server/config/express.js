const path = require('path');
const express = require('express');
const httpError = require('http-errors');
const logger = require('morgan');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const compress = require('compression');
const methodOverride = require('method-override');
const cors = require('cors');
const helmet = require('helmet');
const routes = require('../routes/index.route');
var request = require('request');
const config = require('./config');
const integrations = require('../integrations/');
//const passport = require('./passport')
// View Engine Setup

const app = express();

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

if (config.env === 'development') {
  app.use(logger('dev'));
}

// Choose what fronten framework to serve the dist from
var distDir = '../../dist/';
if (config.frontend == 'react'){
  distDir ='../../node_modules/material-dashboard-react/dist'
 }else{
  distDir ='../../dist/' ;
 }

//
app.use(express.static(path.join(__dirname, distDir)))
app.use(/^((?!(api)).)*/, (req, res) => {
  res.sendFile(path.join(__dirname, distDir + '/index.html'));
});

 //React server
app.use(express.static(path.join(__dirname, '../../node_modules/material-dashboard-react/dist')))
app.use(/^((?!(api)).)*/, (req, res) => {
res.sendFile(path.join(__dirname, '../../dist/index.html'));
});


app.use(bodyParser({limit: '10mb'}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(cookieParser());
app.use(compress());
app.use(methodOverride());

// secure apps by setting various HTTP headers
app.use(helmet());

// enable CORS - Cross Origin Resource Sharing
app.use(cors());

//app.use(passport.initialize());
app.set('views', path.join(__dirname, '../integrations/views'))
app.set('view engine', 'ejs')
//app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// API router
app.use('/api/', routes);
app.use('/api/integrations/', integrations);

// catch 404 and forward to error handler
app.use((req, res, next) => {
  const err = new httpError(404)
  return next(err);
});

app.listen(process.env.PORT, () => {
  console.info(`server started on port ${process.env.PORT} (${config.env})`); // eslint-disable-line no-console
  timeFunction();
  function timeFunction() {
    setTimeout(function () {
      console.log("After 60 seconds!")
      var url = `http://localhost:${process.env.PORT}/api/public/start`
      request(url, function (error, response, body) {
        //console.log('error:', error); // Print the error if one occurred
        //console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
        //console.log('body:', body); // Print the HTML for the Google homepage.
      });
    }, 60000);
  }

});

// error handler, send stacktrace only during development
app.use((err, req, res, next) => {

  // customize Joi validation errors
  if (err.isJoi) {
    err.message = err.details.map(e => e.message).join("; ");
    err.status = 400;
  }
  var message;
  if (err.code==11000) {
    var shortcode_regex = /\{.*?\}/mg;
    err.message.replace(shortcode_regex, function (match, code) {
      var replace_str = match.replace('{', '');
      replace_str = replace_str.replace('}', '');
      replace_str = replace_str.replace(' ', '');
      message="Record already exists " + replace_str + " correct your record."
    })

  }
  else {
    message = err.toString()
  }
  res.status(err.status || 500).json({
    error: true,
    message: message
  });
  next(err);
});

module.exports = app;
