/*

Route Method Functionality
/api/emailCheck  	POST	Check if the email exists in a database
/api/*            	ALL 	Middleware - check if connected
/api/savedImages	GET	    Retrive all saved images of the user
/api/saveImg    	POST	Create MarsImage - save image
/api/deleteImg  	DELETE	Delete a image
/api/deleteAll	    DELETE	Delete all saved images of the user

*/

var express = require('express');
var router = express.Router();
const apiController = require('../controllers/api');

router.post('/emailCheck', apiController.postEmailCheck);

router.all('*', apiController.isConnected);

router.get('/savedImages', apiController.getSavedImages);

router.post('/saveImg', apiController.postSaveImg);

router.delete('/deleteImg', apiController.deleteImg);

router.delete('/deleteAll', apiController.deleteAllImages);

module.exports = router;
