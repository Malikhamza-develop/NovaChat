const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");

let mongod = null;

const connectDB = async () => {
  const uri = process.env.MONGO_URI || process.env.MONGODB_URI;

  if (uri) {
    try {
      await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 5000,
      });

      console.log("MongoDB Connected successfully");
      return;
    } catch (error) {
      console.warn(
        "Could not connect to remote MongoDB:",
        error.message
      );
    }
  }

  try {
    console.log(
      "Initializing embedded MongoDB server..."
    );

    mongod = await MongoMemoryServer.create();

    const memoryUri = mongod.getUri();

    await mongoose.connect(memoryUri);

    console.log(
      "Connected to embedded MongoDB instance:",
      memoryUri
    );
  } catch (error) {
    console.error(
      "Failed to start MongoDB Memory Server:",
      error.message
    );
  }
};

module.exports = connectDB;