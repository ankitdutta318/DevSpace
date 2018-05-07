'use strict';

const express = require('express');
const router = express.Router();
const gravatar = require('gravatar');
const bcrpyt = require('bcryptjs');

// Load user model
const User = require('../../models/User');

//  @route      GET api/users/test
//  @desc       Test users route
//  @accsess    Public
router.get('/test', (req, res) => res.json({
    msg: "User works!"
}));

//  @route      GET api/users/register
//  @desc       Register new users
//  @accsess    Public
router.post('/register', (req, res) => {
    User.findOne({
            email: req.body.email
        })
        .then(user => {
            if (user) {
                return res.status(400).json({
                    email: 'Email already exists.'
                });
            } else {
                const avatar = gravatar.url({
                    s: '200', // Size
                    r: 'pg', // Rating
                    d: 'mm' // Default
                });

                const newUser = new User({
                    name: req.body.name,
                    email: req.body.email,
                    avatar,
                    password: req.body.password
                });

                bcrpyt.genSalt(10, (err, salt) => {
                    bcrpyt.hash(newUser.password, salt, (err, hash) => {
                        if (err) throw err;
                        newUser.password = hash;
                        newUser
                            .save()
                            .then(user => res.json(user))
                            .catch(err => console.log(err));
                    })
                });
            }
        })
});

module.exports = router;