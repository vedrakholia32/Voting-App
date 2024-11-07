const express = require('express');
const cors = require('cors');
const db = require('./db');
const app = express();
require('dotenv').config();
app.use(cors());

const bodyParser = require('body-parser');
app.use(bodyParser.json());
const PORT = process.env.PORT || 3000

const userRoutes = require('./routes/userRoutes')


app.use('/user', userRoutes)

app.listen(3000, () => {
    console.log('listening on port 3000');
})