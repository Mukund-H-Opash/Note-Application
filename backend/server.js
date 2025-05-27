const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
// const bodyParser = require('body-parser');

const { connectDB } = require('./dbconfig/db');
// const cors = require('cors')

dotenv.config();
const app = express();

// app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
// app.use(bodyParser.json()); 
// app.use(bodyParser.urlencoded({ extended: true }));

// app.use('/',)

connectDB();

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));