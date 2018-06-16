const cool = require('cool-ascii-faces')
const express = require('express')
const path = require('path')
const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy;
const OAuth2Strategy = require('passport-oauth').OAuth2Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
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

// passport.use(new LocalStrategy(
//   function(username, password, done) {
//     db.collection('joueur').findOne({ username: username }, function(err, user) {
//       if (err) { return done(err); }
//       if (!user) {
//         return done(null, false, { message: 'Incorrect username.' });
//       }
//       if (!user.validPassword(password)) {
//         return done(null, false, { message: 'Incorrect password.' });
//       }
//       return done(null, user);
//     });
//   }
// ));
passport.use(new FacebookStrategy({
    clientID: '2593367260889259',
    clientSecret: 'db10676e7ef9ed3cc65ebc586918b0ab',
    callbackURL: "https://guarded-shelf-83545.herokuapp.com/auth/facebook/callback"
  },
  function(accessToken, refreshToken, profile, done) {
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
    next();
  })
  .set('views', path.join(__dirname, 'views'))
  .set('view engine', 'ejs')
  .get('/', (req, res) => res.render('pages/index'))
  .use('/users', usersRouter)
  .use('/tournois', tournoisRouter)
  .use('/login-failed', usersRouter)
  .use('/login-success', tournoisRouter)
  .post('/login', function(req, res, next) {
    passport.authenticate('local', function(err, user, info) {
      if (err) { return next(err); }
      if (!user) { return res.json('success'); }
      req.logIn(user, function(err) {
        if (err) { return next(err); }
        return res.json('failed');
      });
    })(req, res, next);
  })
  .get('/auth/facebook', passport.authenticate('facebook'))
  .get('/auth/facebook/callback', passport.authenticate('facebook', {
    successRedirect: '/users',
    failureRedirect: '/'
  }))
  .listen(PORT, () => console.log(`Listening on ${ PORT }`))
