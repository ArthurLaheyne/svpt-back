var express = require('express');
var router = express.Router();
var MongoClient = require('mongodb').MongoClient;
var url = process.env.MONGODB_URI;


/* GET users listing. */
router.get('/', function(req, res, next) {
	// Comment out this line:
  //res.send('respond with a resource');

  // And insert something like this instead:
  MongoClient.connect(url, function (err, client) {
    if (err) throw err

    var db = client.db('heroku_48jsz1bx')

    db.collection('tournoi').find().toArray(function (err, result) {
      if (err) throw err
      res.json(result);
    })
    // res.json([{
    // 	id: 1,
    // 	username: "samsepi0l"
    // }, {
    // 	id: 2,
    // 	username: "D0loresH4ze"
    // }]);
  })
});

module.exports = router;
