/*

Route Method Functionality
/marsImages  	GET	    MarsImages page if connected

*/

var express = require('express');
var router = express.Router();
const marsImagesController = require('../controllers/marsImages');

router.get('/', marsImagesController.get);

module.exports = router;
