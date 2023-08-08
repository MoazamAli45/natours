const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });
// // MONGOOSE
const mongoose = require('mongoose');

// FOR SYNCHRONOUS EXCEPTION
// It must be above
process.on('uncaughtException', (err) => {
  // console.log(err.name, err.message);
  console.log(`UNHANDLED EXCEPTION💥 APPLICATION IS CLOSING...`);

  process.exit(1);
});

// EXPRESS App
const app = require('./app');

// express provide  development environment
// console.log(app.get('env'));

// console.log(process.env);
const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD,
);

// UNCAUGHT EXCEPTION SYNCHRONOUS
// console.log(x);

////// Connection to Database
mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then((con) => {
    // console.log(con.connections);
    console.log('Connected to Database Successfully!');
  });

const port = process.env.PORT || 8000;
// SERVER START
const server = app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

// Asynchronous exception outside of express
// like DB not connected

process.on('unhandledRejection', (err) => {
  console.log(err.name, err.message);
  console.log(`UNHANDLED REJECTION 💥 SERVER IS CLOSING...`);
  // first server close then application close
  server.close(() => {
    process.exit(1);
  });
});
