const express = require('express');
const logger = require('morgan');
const mongoose = require('mongoose');
require('dotenv/config');
const compression = require('compression');

const PORT = process.env.PORT || 3030;

const app = express();

app.use(logger('dev'));

app.use(compression());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(express.static('public'));

// routes
app.use(require('./routes/api.js'));

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true
  , useFindAndModify: false
  , useUnifiedTopology: true
})
  .then(() => {
    app.listen(PORT, () => console.log('==> Listening on port %s. Visit http://localhost:%s/ in your browser.', PORT, PORT));
  })
  .catch((error) => { console.error(error.stack); });