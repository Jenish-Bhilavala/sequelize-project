const express = require('express');
const router = express.Router();

const userRoute = require('../routes/routers/userRoute');
const categoryRoute = require('../routes/routers/categoryRoute');
const portfolioRoute = require('../routes/routers/portfolioRoute');
const testimonialRoute = require('../routes/routers/testimonialRoute');

router.use('/api/user', userRoute);
router.use('/api/category', categoryRoute);
router.use('/api/portfolio', portfolioRoute);
router.use('/api/testimonial', testimonialRoute);

module.exports = router;
