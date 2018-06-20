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

var MongoClient = require('mongodb').MongoClient;
MongoClient.connect(process.env.MONGODB_URI, function (err, client) {
  if (err) throw err
  var db = client.db('heroku_48jsz1bx')
  db.collection('joueur').find().toArray(function (err, result) {
    if (err) throw err
    console.log(result)
  })
})

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
  .use(bodyParser.urlencoded({ extended: false }))
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
  .post('/auth/facebook/token',
    passport.authenticate('facebook-token'),
    function (req, res) {
      // do something with req.user
      if (req.user) {
        MongoClient.connect(process.env.MONGODB_URI, function (err, client) {
          console.log(req.user);
          if (err) throw err
          var db = client.db('heroku_48jsz1bx')
          db.collection('joueur').find({facebookId: req.user.id}).toArray(function (err, result) {
            if (err) throw err
            res.json({joueur: result[0]})
            res.send();
          })
        })
      } else {
        res.send(401);
      }
    }
  )
  .listen(PORT, () => console.log(`Listening on ${ PORT }`))
