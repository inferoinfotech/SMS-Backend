const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const mongoose = require("mongoose");
const connectDB = require("./config/db");
require("dotenv").config();
const authRouter = require("./routes/auth.router");
const societyRouter = require("./routes/society.router");
const logger = require("./config/logger");
const pinoHttp = require("pino-http")({ logger });
const errorHandler = require("./middleware/error.middleware");

const app = express();
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  }),
);
app.use(pinoHttp);
app.use(express.json());
app.use(cookieParser());
app.use("/uploads", express.static("uploads"));

connectDB();

app.use("/api/auth", authRouter);
app.use("/api/society", societyRouter);

// Error handler middleware should be last
app.use(errorHandler);

app.listen(process.env.PORT || 5000, () => {
  logger.info(`Server is running on port ${process.env.PORT || 5000}`);
});

// {

//      "firstname":"fisrtname",
//       "lastname":"lastname",
//       "email":"test@gmail.com",
//       "phoneNumber":"897897987",
//       "country":"abcd",
//       "city":"surat",
//       "state":"gujarat",
//       "selectSociety":"socity",
//       "password":"123",
//       "confirmPassword":"123",
//       "privacyPolicy":true
// }
