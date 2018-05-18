'use strict';

// BASE SETUP
// =============================================================================
// Call all the packages we need
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const passport = require('passport');

const users = require('./routes/api/users');
const profile = require('./routes/api/profile');
const posts = require('./routes/api/posts');


const app = express();

// congigure our app to use bodyParser() middleware
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(bodyParser.json());

// Database connection and configuration
// ============================================================================
// DB config
const db = require('./config/keys').mongoURI;

// Connect to MongoDB
mongoose
    .connect(db)
    .then(() => console.log('MongoDB connected.'))
    .catch(err => console.log(err));


// Passport Congiguation
// =============================================================================
// Passport Middleware
app.use(passport.initialize());

// Passport Config
require('./config/passport')(passport);

// ROUTES FOR OUR API
// =============================================================================
app.get('/', (req, res) => res.send('Hello World! Welcome to DevSpace. A platform for developer to share knowledge and showcase their skills.'));

// Use routes
app.use('/api/users', users);
app.use('/api/profile', profile);
app.use('/api/posts', posts);

const port = process.env.PORT || 5000;

// START THE SERVER
// =============================================================================
app.listen(port, () => console.log(`App runnning on port ${port}`));