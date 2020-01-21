import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';
import authRoute from './routes/users';

// config
dotenv.config();

const app = express();
const db = 'mongodb://localhost/shop';

mongoose.connect(db, { useNewUrlParser: true })
  .then(() => console.log('database connected!!'))
  .catch(() => console.log('database is not connected'));

// middelware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true,
}));

app.use('/', authRoute);

app.use((req, res, next) => {
  const err = new Error('Page not found');
  err.status = 404;
  next(err);
});

// Handling errors
app.use((err, req, res, next) => {
  res.status(err.status || 5000);
  res.send(err.message);
  next();
});

const port = process.env.PORT || 5000;

app.listen(port, console.log(`server starts on ${port}`));
