const express = require('express');
const app = express();
require('dotenv').config();

const cors = require('cors');
app.use(cors());

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.use('/', require('./app/routes/route'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, console.log(`Server listening on ${PORT}`));
