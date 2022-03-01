/*

Route Method Functionality
/logout     GET 	Logout user
/-*-        ALL 	Middleware - check that is not connected
/           GET	    Landing page - will bring up the login page
/login      GET 	Login page
/signIn     GET 	Will bring up the login page
/signIn	    POST	User authentication to access the Mars Images website

*/

var express = require('express');
var router = express.Router();
const authController = require('../controllers/authentication');

router.get('/logout', authController.getLogout);

router.all('*', authController.isConnected);

router.get('/', authController.get);

router.get('/login', authController.getLogin);

router.get('/signIn', authController.getSignIn);

router.post('/signIn', authController.postSignIn);

module.exports = router;
