const db = require('../models');
const bcrypt = require('bcrypt');

/**
 * middleware - check that is not connected.
 * if connected, does not allow access to the registration and login pages.
 */
exports.isConnected = (req, res, next) => {
    if(!req.session.connected)
        next();
    else
        res.redirect('/marsImages');
};

/** Landing page - will bring up the login page */
exports.get = (req, res, next) => {
    res.redirect('/login');
};

/** render login page (and updates the variables of the page). */
exports.getLogin = (req, res, next) => {
    res.render('login', {
        title: 'login',
        signedUp: req.session.signedUp,
        mistake: req.session.mistake,
    });

    req.session.signedUp = false;
    req.session.mistake = false;
    req.session.save();
};

exports.getSignIn = (req, res, next) => {
    res.redirect('/login');
};

/**
 * Verifies that the email exists and that the password is correct
 * if OK redirect to marsImages page
 * else redirect to login page with mistake
 */
exports.postSignIn = (req, res, next) => {
    db.User.findOne({where: {email: req.body.emailAddress.toLowerCase().trim()}})
        .then(async (user) => {
            if(user && await bcrypt.compare(req.body.password, user.password)) {
                req.session.connected = user.email;
                req.session.firstName = user.firstName;
                req.session.lastName = user.lastName;
                res.redirect('/marsImages');
            }
            else {
                req.session.mistake = true;
                res.redirect('/login');
            }
        })
        .catch((err) => {
            console.log('*** There was an error querying user', JSON.stringify(err));
            return res.redirect('/login');
        });
};

/** Logout - deleting the session and redirect to login page */
exports.getLogout = (req, res, next) => {
    req.session.destroy();
    res.redirect('/login');
};
