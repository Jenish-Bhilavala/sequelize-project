const express = require('express');
const router = express.Router();

const userRoute = require('../routes/routers/userRoute');
const categoryRoute = require('../routes/routers/categoryRoute');
const portfolioRoute = require('../routes/routers/portfolioRoute');

router.use('/api/user', userRoute);
router.use('/api/category', categoryRoute);
router.use('/api/portfolio', portfolioRoute);

module.exports = router;
