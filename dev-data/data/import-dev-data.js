const dotenv = require('dotenv');
const mongoose = require('mongoose');
const fs = require('fs');
const Tour = require('./../../models/tourModel');

dotenv.config({ path: './config.env' });

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD,
);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
  })
  .then(() => {
    console.log('Connected to database');
  })
  .catch((err) => {
    console.log(err);
  });

// READ JSON DATA

const Tours = JSON.parse(
  fs.readFileSync(`${__dirname}/tours-simple.json`, 'utf-8'),
);

const importTour = async () => {
  try {
    await Tour.create(Tours);
    console.log('Tours imported');
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

const delteTours = async () => {
  try {
    await Tour.deleteMany({});
    console.log('Tours deleted');
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

if (process.argv[2] === '--import') {
  importTour();
}
if (process.argv[2] === '--delete') {
  delteTours();
}
