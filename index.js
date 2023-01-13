require('dotenv').config();
require('./services/apm');
const express = require('express');
const bodyParser = require('body-parser');
const shows = require('./routes/shows.route');
const profile = require('./routes/profile');
const scrapeSchedule = require('./services/showService');
const memberScrape = require('./services/membersService');
const auth = require('./routes/auth');
const buy = require('./routes/buy');
const topup = require('./routes/topup');
const cors = require('cors');

scrapeSchedule.schedule();
// memberScrape.membersScheduler();

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());
app.use('/shows', shows);
app.use('/auth', auth);
app.use('/buy', buy);
app.use('/profile', profile);
app.use('/topup', topup);

// catch 404 and forward to error handler
app.use((req, res, next) => {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
})

// error handler
app.use((err, req, res, next) => {
  res.locals.message = err.message;
  console.log(err);
  res.status(err.status || 500);
  res.send({
    error: err
  });
})

app.listen(process.env.APPLICATION_PORT, () => {
  console.log(`listening to port ${process.env.APPLICATION_PORT}`)
})

module.exports = app