'use strict';

const express = require('express');
const mongoose = require('mongoose');

const app = express();

// DB config
const db = require('./config/keys').mongoURI;

// Connect to MongoDB
mongoose.connect(db)
    .then(() => console.log('MongoDB connected.'))
    .catch(err => console.log(err));

app.get('/', (req, res) => res.send('Hello World'));

const port = process.env.PORT || 5000;

app.listen(port, () => console.log(`App runnning on port ${port}`));