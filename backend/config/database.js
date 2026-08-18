const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");

let mongod = null;

const connectDB = async () => {
  const uri = process.env.MONGO_URI || process.env.MONGODB_URI;

  if (uri) {
    try {
      await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 1500,
      });

      console.log("MongoDB Connected successfully");
      return;
    } catch (error) {
      console.warn(
        "Could not connect to MongoDB, attempting embedded MongoDB server:",
        error.message
      );
    }
  }

  try {
    console.log("Initializing embedded MongoDB server...");

    const mongoServerPromise = MongoMemoryServer.create();

    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(
        () => reject(new Error("MongoMemoryServer timeout")),
        5000
      )
    );

    mongod = await Promise.race([
      mongoServerPromise,
      timeoutPromise,
    ]);

    const memoryUri = mongod.getUri();

    await mongoose.connect(memoryUri);

    console.log("Connected to embedded MongoDB instance");
  } catch (error) {
    console.warn(
      "Embedded MongoDB Server could not start:",
      error.message
    );
  }
};

module.exports = connectDB;