/*

Route Method Functionality
/register               GET 	Register page - fill in an email and name
/register/password      GET 	Will bring up the register page
/register/password      POST	Password page - choose a password after filling in an email and name
/register/addUser       GET 	Will bring up the register page
/register/addUser       POST 	Add new user - will bring up the login page

*/

var express = require('express');
var router = express.Router();
const registerController = require('../controllers/register');

router.get('/', registerController.get);

router.get('/password', registerController.getPassword);

router.post('/password', registerController.postPassword);

router.get('/addUser', registerController.getAddUser);

router.post('/addUser', registerController.postAddUser);

module.exports = router;
