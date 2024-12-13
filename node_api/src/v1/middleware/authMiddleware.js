const jwt = require('jsonwebtoken');


// verifies the bearer token exists and that it is valid
exports.verify = (req,res,next) => 
{
    console.log(req.headers.authorization)
    let authHeader = req.headers.authorization

    if (!authHeader)
        return res.status(401).send('Unauthorized, bearer token is required')

    authHeader = authHeader.split(' ')

    if (authHeader.length != 2 || authHeader[0].toLowerCase() != 'bearer')
        return res.status(401).send('Unauthorized, header not formatted correctly')

    const token = authHeader[1];

    try {
        const decoded = jwt.verify(token, process.env.TOKEN_SECRET); // Verify and decode the token
        req.email = decoded.data.email; // Optionally pass decoded data (e.g., user info) to the request object
        next(); // Proceed to the next middleware
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).send('Unauthorized, token has expired');
        } else if (error.name === 'JsonWebTokenError') {
            return res.status(401).send('Unauthorized, token is invalid');
        } else {
            return res.status(500).send('Internal Server Error');
        }
    }
}