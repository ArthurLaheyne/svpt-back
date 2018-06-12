const cool = require('cool-ascii-faces')
const express = require('express')
const path = require('path')
const PORT = process.env.PORT || 5000

const { Pool } = require('pg');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: true
});

var usersRouter = require('./routes/users');
var tournoisRouter = require('./routes/tournois');

var MongoClient = require('mongodb').MongoClient;
var url = process.env.MONGODB_URI;
console.log(url);

MongoClient.connect(url, function (err, client) {
  if (err) throw err

  var db = client.db('heroku_48jsz1bx')

  db.collection('joueur').find().toArray(function (err, result) {
    if (err) throw err

    console.log(result)
  })
})

express()
  .use(express.static(path.join(__dirname, 'public')))
  .use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
  })
  .set('views', path.join(__dirname, 'views'))
  .set('view engine', 'ejs')
  .get('/', (req, res) => res.render('pages/index'))
  .get('/cool', (req, res) => res.send(cool()))
  .get('/times', (req, res) => {
    let result = ''
    const times = process.env.TIMES || 5
    for (i = 0; i < times; i++) {
      result += i + ' '
    }
    res.send(result)
  })
  .get('/db', async (req, res) => {
    try {
      const client = await pool.connect()
      const result = await client.query('SELECT * FROM test_table');
      res.render('pages/db', result);
      client.release();
    } catch (err) {
      console.error(err);
      res.send("Error " + err);
    }
  })
  .use('/users', usersRouter)
  .use('/tournois', tournoisRouter)
  .listen(PORT, () => console.log(`Listening on ${ PORT }`))
