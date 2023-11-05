require("dotenv").config('./.env');
const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 5000;


app.use(express.json());
app.use(cors());

const authRouter= require('./routes/authRoute');

app.use('/api/auth', authRouter);

app.listen(PORT, () => {
    console.log('Server is running on port: ' + PORT);
  });