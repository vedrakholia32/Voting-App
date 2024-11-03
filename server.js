const express = require('express');
const db = require('./db');
const app = express();
require('dotenv').config();


const bodyParser = require('body-parser');
app.use(bodyParser.json());
const PORT = process.env.PORT || 3000

const userRoutes = require('./routes/userRoutes')
const candidateRoutes = require('./routes/candidateRoutes')


app.use('/user', userRoutes)
app.use('/candidate', candidateRoutes)


app.listen(3000, () => {
    console.log('listening on port 3000');
})