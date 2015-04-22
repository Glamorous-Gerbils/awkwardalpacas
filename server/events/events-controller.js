var mongo = require('mongodb').MongoClient
var ObjectID = require('mongodb').ObjectID;
var jwt  = require('jwt-simple');
var db = require('../db/db.js')


module.exports = {
	allEvents: function(req, res) {
    var db = req.db;
    var events = []
    var cursorCount = 0
    var iso = (new Date()).toISOString();
    var options = { 'sort' : {'datetime': 1}, 'limit': 10}
    var collection = db.get('corgievent');
    var userCollection = db.get('corgiuser');
    var promise =  collection.find({ 'datetime': { $gt: iso}}, { sort: {datetime: 1}}, function (err, docs) {
    });
    promise.on('complete', function (err,docs) {
        var data = [];
        docs.forEach(function (doc) {
          var userPromise = userCollection.find({_id: doc.creatorID}, function (err, userdocs) {});
          userPromise.on('complete', function (err, userdocs) {
            doc.creator = userdocs[0].name;
            console.log('inside user promise', doc)
          data.push(doc);
          if (data.length === docs.length) {
            res.send(docs);
          }
          });
        })
    });
	},

	newEvent: function(req, res) {
    var event = req.body.event;
    var userToken = req.body.token;
    var username = jwt.decode(userToken, 'secret');
    var foundUser = db.get('corgiuser').find( {name: username} );
    foundUser.on('data', function (user) {
      var userInfo = {
        username: user.name
      };
      event.creatorID = user._id.toString();
      event.attendeeIDs = [userInfo];
  		db.get('corgievent').insert(event);
      res.json(event);
    });
	},

  joinEvent: function(req, res) {
    var eventID = req.body.event._id;
    var userToken = req.body.token;
    console.log('eventID: ', eventID);
    var username = jwt.decode(userToken, 'secret');
    var promise = db.get('corgiuser').find( {name: username} );
    promise.on('complete', function (err, user) {
      console.log('oustide', user)
      db.get('corgievent').find({_id: eventID}, function (err, event) {
        var inList = false;
        console.log('event',event[0].attendeeIDs)
        event[0].attendeeIDs.forEach(function (attendee){
          console.log('username', user)
          if (attendee.username === user[0].name){
            inList = true;
          }
        });
        if (!inList) {

          event[0].attendeeIDs.push({username: user[0].name})
        }
      })
      res.end();
    });

  }
}
