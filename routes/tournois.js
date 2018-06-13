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

    db.collection('joueur').find().toArray(function (err, joueurs) {
      if (err)
        throw err
      else {
        db.collection('tournoi').find().toArray(function (err, tournois) {
          if (err)
            throw err
          else {
            tournois.forEach( (tournoi, i) => {
              tournoi.resultat.forEach( (resultat, i2) => {
                tournois[i].resultat[i2].joueur = joueurs.find( (element) => {
                  return element._id == resultat.joueur;
                })
              })
            })
            res.json(tournois);
          }
        })
      }
    })
  })
});

module.exports = router;
