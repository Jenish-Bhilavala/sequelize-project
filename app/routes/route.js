const express = require('express');
const router = express.Router();

const userRoute = require('../routes/routers/userRoute');

router.use('/api/user', userRoute);

module.exports = router;
