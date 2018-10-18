'use strict';

const express = require('express');
const router = express.Router();
const gravatar = require('gravatar');
const bcrpyt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const keys = require('../../config/keys');

// Load Input validation
const validateRegisterInput = require('../../validation/register');
const validateLoginInput = require('../../validation/login');

// Load user model
const User = require('../../models/User');
// Load profile model
const Profile = require('../../models/Profile');

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
    const {
        errors,
        isValid
    } = validateRegisterInput(req.body);

    // Check validation
    if (!isValid) {
        return res.status(400).json(errors);
    }

    User.findOne({
            email: req.body.email
        })
        .then(user => {
            if (user) {
                errors.email = 'Email already exists';
                return res.status(400).json(errors);
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

//  @route      GET api/users/login
//  @desc       Login User / Return JWT token
//  @accsess    Public
router.post('/login', (req, res) => {

    const {
        errors,
        isValid
    } = validateLoginInput(req.body);

    // Check validation
    if (!isValid) {
        return res.status(400).json(errors);
    }

    const email = req.body.email;
    const password = req.body.password;

    // Find user by email
    User.findOne({
            email
        })
        .then(user => {
            // Check for User existing
            if (!user) {
                errors.email = 'User not found';
                return res.status(404).json(errors);
            }

            // Check password 
            bcrpyt.compare(password, user.password)
                .then(isMatch => {
                    if (isMatch) {
                        // User Matched

                        const payload = {
                            id: user.id,
                            name: user.name,
                            avatar: user.avatar
                        }; // Create JWT Payload

                        // Sign Token
                        jwt.sign(payload,
                            keys.secretOrKey, {
                                expiresIn: 3600
                            },
                            (err, token) => {
                                res.json({
                                    success: true,
                                    token: 'bearer ' + token
                                })
                            });
                    } else {
                        errors.password = 'Password incorrect';
                        return res.status(400).json(errors);
                    }

                })
        })
});

//  @route      GET api/users/current
//  @desc       Return current user
//  @accsess    Private
router.get('/current', passport.authenticate('jwt', {
    session: false
}), (req, res) => {
    res.json({
        id: req.user.id,
        name: req.user.name,
        email: req.user.email
    });
});

//  @route      DELETE api/user
//  @desc       Delete user and profile
//  @accsess    Private
router.delete('/', passport.authenticate('jwt', {
    session: false
}), (req, res) => {
    Profile.findOneAndRemove({
            user: req.user.id
        })
        .then(() => {
            User.findOneAndRemove({
                    _id: req.user.id
                })
                .then(() => res.json({
                    success: true
                }));
        });
});

module.exports = router;