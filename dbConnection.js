// const { mongoose } = require("mongoose");

// const dbConnect = async () => {
//   try {
//     // Directly connect to remote MongoDB database
//     const connectionString =
//       "mongodb+srv://mohaiudinzwl:i6N8GJjmhR4BwfHv@maddy.qdmev.mongodb.net/ResumeMaker?retryWrites=true&w=majority&appName=Maddy";

//     await mongoose.connect(connectionString, {
//       serverSelectionTimeoutMS: 10000,
//     });

//     console.log("Connected to Remote MongoDB successfully!");
//   } catch (error) {
//     console.error("Database connection error:", error);
//   }
// };

// dbConnect();

const mongoose = require("mongoose");

// Use environment variables for sensitive data
const connectionString =
  process.env.MONGODB_URI ||
  "mongodb+srv://mohaiudinzwl:i6N8GJjmhR4BwfHv@maddy.qdmev.mongodb.net/ResumeMaker?retryWrites=true&w=majority&appName=Maddy";

let cachedConnection = null;

const dbConnect = async () => {
  if (cachedConnection) {
    console.log("Using cached database connection");
    return cachedConnection;
  }

  try {
    const connection = await mongoose.connect(connectionString, {
      serverSelectionTimeoutMS: 10000, // 10 seconds timeout for server selection
      socketTimeoutMS: 45000, // 45 seconds timeout for queries
      maxPoolSize: 10, // Increase connection pool size
    });

    console.log("Connecting to Remote MongoDB...");
    cachedConnection = connection;
    return connection;
  } catch (error) {
    console.error("Database connection error:", error);
    throw error; // Re-throw the error to handle it in the calling function
  }
};

// Gracefully close the connection when the application exitss
process.on("SIGINT", async () => {
  try {
    await mongoose.connection.close();
    console.log("Mongoose connection closed due to application termination");
    process.exit(0);
  } catch (error) {
    console.error("Error closing Mongoose connection:", error);
    process.exit(1);
  }
});

module.exports = dbConnect;
