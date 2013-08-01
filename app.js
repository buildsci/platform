
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes/routes.js')
  , lite = require("./routes/lite.js")
  , partial = require("./routes/partial.js")
  , http = require('http')
  , path = require('path');

var app = express();

// all environments
app.set('port', process.env.PORT || 8080);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', routes.getIndex);
app.get('/lite', routes.getLite);
app.get('/literesults', routes.getLiteResults);
app.get('/partial', routes.getPartial);
app.get('/substantial', routes.getSubstantial);
app.get('/comprehensive', routes.getComprehensive);

//Posts
app.post('/liteanalysis', lite.liteanalysis);
app.post('/partialanalysis', partial.partial);

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
