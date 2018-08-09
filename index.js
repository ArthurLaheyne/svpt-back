const cool = require('cool-ascii-faces')
const express = require('express')
const path = require('path')
const passport = require('passport')
const FacebookTokenStrategy = require('passport-facebook-token');
const session = require("express-session")
const bodyParser = require("body-parser");
const flash = require('connect-flash');
const PORT = process.env.PORT || 5000

var usersRouter = require('./routes/users');
var tournoisRouter = require('./routes/tournois');
var giphynewsRouter = require('./routes/giphynews');

var MongoClient = require('mongodb').MongoClient;
// MongoClient.connect(process.env.MONGODB_URI, function (err, client) {
//   if (err) throw err
//   var db = client.db('heroku_48jsz1bx')
//   db.collection('joueur').find().toArray(function (err, result) {
//     if (err) throw err
//     console.log(result)
//   })
// })

passport.use(new FacebookTokenStrategy({
    clientID: '2593367260889259',
    clientSecret: 'db10676e7ef9ed3cc65ebc586918b0ab'
  }, function(accessToken, refreshToken, profile, done) {
    console.log("Auth done");
    done(null, profile);
  }
));
passport.serializeUser(function(user, done) {
  done(null, user);
});
passport.deserializeUser(function(user, done) {
  done(null, user);
});


express()
  .use(express.static("public"))
  .use(session({ secret: "cats" }))
  .use(bodyParser.json()) // support json encoded bodies
  .use(bodyParser.urlencoded({ extended: true }))
  .use(passport.initialize())
  .use(passport.session())
  .use(flash())
  .use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header('Access-Control-Allow-Headers: Origin, Content-Type, X-Auth-Token');
    next();
  })
  .set('views', path.join(__dirname, 'views'))
  .set('view engine', 'ejs')
  .get('/', (req, res) => res.render('pages/index'))
  .use('/users', usersRouter)
  .use('/tournois', tournoisRouter)
  .use('/giphynews', giphynewsRouter)
  .post('/giphynew', function (req, res) {
    // do something with req.user
    if (req.body.html) {
      MongoClient.connect(process.env.MONGODB_URI, function (err, client) {
        if (err) throw err
        var db = client.db('heroku_48jsz1bx')
        db.collection('joueur').findOne({facebookId: req.body.facebookId}, function (err, result) {
          if (err) throw err
          console.log(req.body.facebookId, result);
          const joueur = result;
          if (joueur.gifTokens > 0) {
            db.collection('giphynew').insert({
              body: req.body.html,
              publishedAt: Date.now(),
              author: joueur.pseudo,
            }, function (err, result) {
              if (err) throw err
              console.log(joueur._id);
              db.collection('joueur').update(
                { _id: joueur._id },
                {
                  $inc: { gifTokens: -1 }
                }
              )
              res.send(200);
            })
          } else {
            res.send(401);
          }
        })
      })
    } else {
      res.send(401);
    }
  })
  .post('/giphynew/addTokens', function (req, res) {
    console.log(req.body);
    // do something with req.user
    if (req.body.quantite && req.body.pseudo) {
      MongoClient.connect(process.env.MONGODB_URI, function (err, client) {
        if (err) throw err
        var db = client.db('heroku_48jsz1bx')
        db.collection('joueur').findOne({pseudo: req.body.pseudo}, function (err, result) {
          if (err) throw err
          const joueur = result;
          db.collection('joueur').update(
            { _id: joueur._id },
            {
              $inc: { gifTokens: 1 }
            }
          )
          res.send(200);
        })
      })
    } else {
      res.send(401);
    }
  })
  .post('/auth/facebook/token',
    passport.authenticate('facebook-token'),
    function (req, res) {
      // do something with req.user
      if (req.user) {
        MongoClient.connect(process.env.MONGODB_URI, function (err, client) {
          console.log(req.user);
          if (err) throw err
          var db = client.db('heroku_48jsz1bx')
          db.collection('joueur').findOne({facebookId: req.user.id}, function (err, result) {
            if (err) throw err
            res.json({joueur: result})
            res.send();
          })
        })
      } else {
        res.send(401);
      }
    }
  )
  .listen(PORT, () => console.log(`Listening on ${ PORT }`))
