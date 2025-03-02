const resumeRouter = require("./routes/resumeRouter");
const express = require("express");
const cors = require("cors"); // Import the cors package
const app = express();
const http = require("http");
const path = require("path");
const userRouter = require("./routes/userRouter");
const adminRouter = require("./routes/adminRouter");
const trafficRouter = require("./routes/traffic");
const liveChatRouter = require("./routes/chat");
const Striperouter = require("./routes/stripe/checkoutSession");
const webHookRouter = require("./routes/stripe/webhookRouter");
require("dotenv").config();
const port = process.env.PORT || 8686;
const server = http.createServer(app);
const dbConnect = require("./dbConnection"); // Adjust the path accordingly

// Call dbConnect to establish the database connection
dbConnect()
  .then(() => {
    console.log("Database connection established");
  })
  .catch((error) => {
    console.error("Failed to establish database connection:", error);
    process.exit(1); // Exit the process if the database connection fails
  });

// Enable CORS for all routes
app.use(cors());
app.use(express.json());

// ✅ Stripe webhook route (must be before express.json())

app.use("/stripe", webHookRouter);
// ✅ Parse JSON request bodies (as sent by API clients
app.use(express.json());

// ✅ Serve static files
app.use("/resume/public", express.static(path.join(__dirname, "public")));

// ✅ Default route
app.get("/", async (req, res) => {
  try {
    res.send("Welcome to Resume API v2.0");
  } catch (error) {
    console.log(error.message);
  }
});

// ✅ Stripe success route
app.get("/success", (req, res) => {
  try {
    res.sendFile(path.join(__dirname, "./html/success.html"));
  } catch (error) {
    console.log(error.message);
    res.status(500).send("Internal Server Error");
  }
});

// ✅ Stripe canceled route
app.get("/canceled", (req, res) => {
  try {
    res.sendFile(path.join(__dirname, "./html/canceled.html"));
  } catch (error) {
    console.log(error.message);
    res.status(500).send("Internal Server Error");
  }
});

// ✅ User routes
app.use("/resume/users", userRouter);
app.use("/resume/addresume", resumeRouter);
app.use("/resume/stripe", Striperouter);


// ✅ Admin routes
app.use("/resume/admin", adminRouter);

// ✅ Traffic routes
app.use("/resume/traffic", trafficRouter);

// ✅ Chat routes
app.use("/resume/chat", liveChatRouter);

// ✅ Error handlers (Add any custom error handlers here if needed)

// ✅ Start the server
server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

// const resumeRouter = require("./routes/resumeRouter");
// const express = require("express");
// const cors = require("cors"); // Import the cors package
// const app = express();
// const http = require("http");
// const path = require("path");
// const userRouter = require("./routes/userRouter");
// require("dotenv").config();
// const port = process.env.PORT || 8686;
// const server = http.createServer(app);
// const dbConnect = require("./dbConnection"); // Adjust the path accordingly
// const Striperouter = require("./routes/stripe/checkoutSession");

// // Call dbConnect to establish the database connection
// dbConnect()
//   .then(() => {
//     console.log("Database connection established");
//   })
//   .catch((error) => {
//     console.error("Failed to establish database connection:", error);
//     process.exit(1); // Exit the process if the database connection fails
//   });

// // Enable CORS for all routes
// app.use(cors());

// app.use(express.json());

// // ✅ Serve static files
// app.use("/resume/public", express.static(path.join(__dirname, "public")));

// // ✅ Default route
// app.get("/", async (req, res) => {
//   try {
//     res.send("Welcome to Resume API");
//   } catch (error) {
//     console.log(error.message);
//   }
// });

// // ✅ Stripe success route
// app.get("/success", (req, res) => {
//   try {
//     res.sendFile(path.join(__dirname, "./html/success.html"));
//   } catch (error) {
//     console.log(error.message);
//     res.status(500).send("Internal Server Error");
//   }
// });

// // ✅ Stripe canceled route
// app.get("/canceled", (req, res) => {
//   try {
//     res.sendFile(path.join(__dirname, "./html/canceled.html"));
//   } catch (error) {
//     console.log(error.message);
//     res.status(500).send("Internal Server Error");
//   }
// });

// // ✅ User routes
// app.use("/resume/users", userRouter);
// app.use("/resume/stripe", Striperouter);
// app.use("/resume/addresume", resumeRouter);

// // ✅ Start the server
// server.listen(port, () => {
//   console.log(`Server is running on port ${port}`);
// });
