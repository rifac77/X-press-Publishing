const bodyParser = require('body-parser');
const cors = require('cors');
const errorhandler = require('errorhandler');
const morgan = require('morgan');
const express = require('express');
const app = express();
const apiRouter = require('./api/api');
const PORT = process.env.PORT || 3001;

app.use(bodyParser.json());
app.use(errorhandler());
app.use(cors());
app.use(morgan('dev'));
app.use('/api', apiRouter);

app.listen(PORT, () => {
    console.log('listening on port: '+ PORT);
});

module.exports = app;