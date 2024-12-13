const {validateBody, checkValidation, auth, validateCheckTokenBody, newToken} = require('../controllers/authController')
const express = require('express');

const {verify} = require('../middleware/authMiddleware')

const router = express.Router();


// allows the user to login 
router.post('/auth',validateBody, checkValidation, auth)


// Checks the validity of the current token, if valid it returns a newer token 
// so that the user can stay logged in
router.post('/checkToken', verify, validateCheckTokenBody, checkValidation, newToken )

module.exports = router

