const fs = require('fs');
const dotenv = require('dotenv');

dotenv.config({ path: '../../config.env' });
// // MONGOOSE
const mongoose = require('mongoose');

const tourModel = require('../../Model/tourModel');
const userModel = require('../../Model/userModel');
const reviewModel = require('../../Model/reviewModel');

const Tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`, 'utf-8'));
const Users = JSON.parse(fs.readFileSync(`${__dirname}/users.json`, 'utf-8'));
// AS not in callback so I am using synchronous function

// JSON.parse convert into obj form
const Reviews = JSON.parse(
  fs.readFileSync(`${__dirname}/reviews.json`, 'utf-8'),
);

// console.log(process.env.DATABASE);

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD,
);

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

const importData = async () => {
  try {
    await tourModel.create(Tours);
    await userModel.create(Users, {
      validateBeforeSave: false,
    });
    await reviewModel.create(Reviews);
    console.log('Data Successfully Loaded');
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

const deleteData = async () => {
  try {
    const tours = await tourModel.deleteMany();
    const users = await userModel.deleteMany();
    const reviews = await reviewModel.deleteMany();
    console.log('Data Successfully Deleted');
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

// Command
/// node import-dev-data --import/--delete
if (process.argv[2] === '--import') {
  importData();
} else if (process.argv[2] === '--delete') {
  deleteData();
}

// console.log(process.argv);
