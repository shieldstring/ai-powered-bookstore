const mongoose = require("mongoose");
const { insertSampleData } = require("../scripts/bookSampleData");

const connectDB = async (populateData = false) => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);

    // Optionally populate with sample data
    if (populateData) {
      try {
        const result = await insertSampleData();
        console.log(`Database populated with ${result.length} books`);
      } catch (dataError) {
        console.error(`Error populating database: ${dataError.message}`);
        // Note: We don't exit the process here since the connection was successful
      }
    }

    return conn;
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
