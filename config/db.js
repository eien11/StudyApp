const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useCreateIndex: true,
      useFindAndModify: false,
      useUnifiedTopology: true,
    });
    console.log(`Connected to database ${conn.connection.host}.`.cyan.underline.bold);
  } catch (error) {
    console.log(error);
  }
};

module.exports = connectDB;
