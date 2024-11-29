const express = require('express');
const router = express.Router();

const userRoute = require('../routes/routers/userRoute');
const categoryRoute = require('../routes/routers/categoryRoute');

router.use('/api/user', userRoute);
router.use('/api/category', categoryRoute);

module.exports = router;
