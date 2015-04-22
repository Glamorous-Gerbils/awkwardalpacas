var express = require('express');
var mongoose = require('mongoose');
var path = require('path');
var mongo = require ('mongodb');
var monk = require('monk');

var app = express();
var db = require('./db/db.js')

app.use(express.static(__dirname + '/..'));

app.use(function (req, res, next) {
  req.db = db;
  next();
});

app.get("/", function (req, res) {
  res.sendFile('index.html', {root: __dirname + '/../client/app'});
});

require('./middleware.js')(app, express);

var server = app.listen(process.env.PORT, function () {

  var host = server.address().address;
  var port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);

});
