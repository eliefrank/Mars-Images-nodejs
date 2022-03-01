const Cookies = require('cookies');
const db = require('../models');
const bcrypt = require('bcrypt');

/**
 * render register page.
 */
exports.get = (req, res, next) => {
    res.render('register', {
        title: 'sign up',
        existingEmailError: req.session.existingEmail ? '' : 'd-none',
    });

    req.session.existingEmail = false;
    req.session.save();
};

exports.getPassword = (req, res, next) => {
    res.redirect('/register');
};

/**
 * set cookies for a minute (to check that the registration is completed in one minute)
 * render password page to select a password.
 */
exports.postPassword = (req, res, next) => {
    req.session.email = req.body.emailAddress.toLowerCase().trim();
    req.session.firstName = req.body.firstName.trim();
    req.session.lastName = req.body.lastName.trim();

    const cookies = new Cookies(req, res, {keys: ['keyboard cat']});
    cookies.set('RegisterTime', new Date().toISOString(), {signed: true, maxAge: 60 * 1000});

    res.render('password', {
        title: 'password selection',
    });
};

exports.getAddUser = (req, res, next) => {
    res.redirect('/register');
};

/**
 * Add a new user if it does not already exist and the registration is completed in one minute.
 * if successfully added redirect login page with a registration message,
 * else returns to the beginning of the registration
 */
exports.postAddUser = async (req, res, next) => {
    const cookies = new Cookies(req, res, {keys: ['keyboard cat']});
    // Get the cookie
    const registerTime = cookies.get('RegisterTime', {signed: true})

    const email = req.session.email;
    const firstName = req.session.firstName;
    const lastName = req.session.lastName;
    const password = req.body.password;

    if (registerTime && validateData(email, firstName, lastName, password)) {
        db.User.findOrCreate({
            where: { email: email },
            defaults: { firstName, lastName, email, password: await bcrypt.hash(password, 10)
            }})
            .then((created) => {
                if (created[1]) {
                    req.session.signedUp = true;
                    res.redirect('/login');
                }
                else {
                    req.session.existingEmail = true;
                    res.redirect('/register');
                }
            })
            .catch((err) => {
                console.log('*** There was an error', JSON.stringify(err));
                return res.redirect('/register');
            });
    }
    else
        res.redirect('/register');
};

/**
 * a module for server-side registry authentication functions
 * @type {{isLettersOnly: (function(*=): boolean), isValidPassword: (function(*): boolean),
 *         isNotEmpty: (function(*=): boolean|boolean), isValidEmail: (function(*=): boolean)}}
 */
const validatorModule = (function() {
    /**
     * checks if a string is empty or NULL or undefined.
     * @param str - the string to validate
     * @returns {boolean} - boolean valid or not
     */
    const isNotEmpty = (str) => (str === null || str === undefined) ? false : (str?.length !== 0)

    /**
     * checks if a string is valid email
     * @param str - the string to validate
     * @returns {boolean} - boolean valid or not
     */
    const isValidEmail = (str) => (/^[\w-\.]+@([\w-]+\.?)*[a-zA-Z0-9]+$/.test(str))

    /**
     * checks if a string contains letters only (with a single space between words)
     * @param str - the string to validate
     * @returns {boolean} - boolean valid or not
     */
    const isLettersOnly = (str) => (/^([A-Za-z]+[ ]?)+$/.test(str))

    /**
     * checks if a string is at least 8 in length
     * @param str - the string to validate
     * @returns {boolean} - boolean valid or not
     */
    const isValidPassword = (str) => (str.length >= 8)

    return {
        isNotEmpty: isNotEmpty,
        isValidEmail: isValidEmail,
        isLettersOnly: isLettersOnly,
        isValidPassword: isValidPassword
    }
}) ();

/**
 * A function that receives input and a validation function and checks that the input is correct according to the validation function.
 * @param inputValue - the input to validate
 * @param validateFunc - the validation function
 * @returns {*} - boolean valid or not
 */
const validateInput = (inputValue, validateFunc) => {
    return validateFunc(inputValue); // call the validation function
}

/**
 * Validate the input. (All validation is performed by the function validateInput)
 * validation for all inputs that are not empty,
 * if the input is not empty, verify that it is also valid.
 * @param email - the email input
 * @param firstName - the firstName input
 * @param lastName - the lastName input
 * @param password - the password input
 * @returns {*} - boolean: false in case a input validation failed. (true only if all validations are true)
 */
const validateData = (email, firstName, lastName, password) => {
    let v1 = (validateInput(email, validatorModule.isNotEmpty) && validateInput(email, validatorModule.isValidEmail));
    let v2 = (validateInput(firstName, validatorModule.isNotEmpty) && validateInput(firstName, validatorModule.isLettersOnly));
    let v3 = (validateInput(lastName, validatorModule.isNotEmpty) && validateInput(lastName, validatorModule.isLettersOnly));
    let v4 = (validateInput(password, validatorModule.isNotEmpty) && validateInput(password, validatorModule.isValidPassword));

    return (v1 && v2 && v3 && v4);
}
