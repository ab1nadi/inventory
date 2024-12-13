const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const morgan = require('morgan')


mongoose.connect('mongodb://inventory:27017/inventory')

const authRoutes = require('./routes/authRoutes');
const authorizedRoutes = require('./routes/authorizedRoutes');
const authMiddleWear = require('./middleware/authMiddleware')

router.use(morgan('dev'));


router.use('', authRoutes)

router.use('/authorized', authMiddleWear.verify, authorizedRoutes);


router.post('/wtf', (res, req)=>
{
    req.status(200).send("what the freak")
})

module.exports = router;