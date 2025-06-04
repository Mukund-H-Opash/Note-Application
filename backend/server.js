const express = require('express');
const http = require('http');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
const router = require('./routes/authRoutes');
const noteRouter = require('./routes/notesRoutes');
const adminRouter = require('./routes/adminRoutes');
const { connectDB } = require('./dbconfig/db');
const app = express();
const server = http.createServer(app);
const io = require('socket.io')(server, {
  cors: {
    origin: 'http://localhost:3000', //  frontend URL
    credentials: true,

  }
});
dotenv.config();
require('./socket/socket')(io); 

const cors = require('cors');
app.use(cors({ origin: 'http://localhost:3000', credentials: true }));

const port = process.env.PORT || 5000;
server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/notes', noteRouter);
app.use('/admin', adminRouter);
app.use('/auth', router);

connectDB();
