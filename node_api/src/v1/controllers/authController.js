const { body, validationResult } = require('express-validator');
const { authenticate } = require('ldap-authentication');
const jwt = require('jsonwebtoken');

const FailedLoginsModel = require('../models/failedLoginsModel');


// Define validation rules in the controller
exports.validateBody = [
  body('password').notEmpty().withMessage('Password is required'),
  body('email').isEmail().withMessage('Valid email is required'),
];

// Handle validation results in the controller
exports.checkValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next(); // If no errors, move to the next middleware
};

// Authenticate a user against Active Directory 
// Uses email and password from body
exports.auth = async (req, res) => {

  const { email, password } = req.body; // Assuming email and password are sent in the body

  try {

    let t = createToken(email); // Pass email to createToken to generate a valid token
    return res.status(200).json({ token: t }); // Correctly use r
    
    const options = {
      ldapOpts: {
        url: process.env.AD_URL,
      },
      adminDn: process.env.AD_ADMIN_DN,
      adminPassword: process.env.AD_ADMIN_PASSWORD,
      userSearchBase: process.env.AD_BASE,
      usernameAttribute:'userPrincipalName',
      username: email,
      userPassword: password,
    };

    const ldapUser = await authenticate(options);

    
    if (!ldapUser) {

      return res.status(401).json({ error: 'Authentication failed' });
    }

    // Authentication successful
    const token = createToken(email); // Pass email to createToken to generate a valid token
    return res.status(200).json({ token: token }); // Correctly use return to send response
  } catch (error) {

    if (error.lde_message === 'Invalid Credentials') {

      // log a failed login attempt for this email
      const newFailedLogin = new FailedLoginsModel({
        userEmail:email
    })

    await newFailedLogin.save()

      // Handle invalid credentials
      return res.status(401).json({ error: 'Invalid credentials. Please check your email and password.' });
    } 

    // Catch and handle other errors
    console.error('Authentication error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};



exports.validateCheckTokenBody = [
  body('email').isEmail().withMessage('Valid email is required'),
];
exports.newToken = async (req, res) => {
  const { email } = req.body; // Assuming email and password are sent in the body

  const token = createToken(email); // Pass email to createToken to generate a valid token
  return res.status(200).json({ token }); // Correctly use return to send response
};

// Creates a JSON Web Token 
function createToken(email) {
  return jwt.sign(
    { data: { email: email } }, // Payload
    process.env.TOKEN_SECRET,   // Secret key from environment variable
    { expiresIn: process.env.TOKEN_EXPIRATION } // Token expiration
  );
}
