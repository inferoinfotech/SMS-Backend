const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const mongoose = require("mongoose");
const connectDB = require("./config/db");
require("dotenv").config();
const authRouter = require("./routes/auth.router");
const societyRouter = require("./routes/society.router");
const residentRouter = require("./routes/resident.router");
const maintenanceRouter = require("./routes/maintenece");
const incomeRouter = require("./routes/income");
const logger = require("./config/logger");
const pinoHttp = require("pino-http")({ logger });
const errorHandler = require("./middleware/error.middleware");
const expanseRouter = require("./routes/expanse.router");
const noteRouter = require("./routes/note.router");
const facilityRouter = require("./routes/facility.router");
const complainRouter = require("./routes/complain");
const requestTrackingRouter = require("./routes/requestTracking.router");
const securityProtocolRouter = require("./routes/securityProtocol.router");
const securityGuardRouter = require("./routes/securityGuard.router");
const announcementRouter = require("./routes/Announcement.router");
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
app.use("/api/resident", residentRouter);
app.use("/api/maintenance", maintenanceRouter);
app.use("/api/income", incomeRouter);
app.use("/api/expanse", expanseRouter);
app.use("/api/note", noteRouter);
app.use("/api/facility", facilityRouter);
app.use("/api/complain", complainRouter);
app.use("/api/request", requestTrackingRouter);
app.use("/api/security-protocol", securityProtocolRouter);
app.use("/api/security-guard", securityGuardRouter);
app.use("/api/announcement", announcementRouter);

app.use(errorHandler);

app.listen(process.env.PORT || 5000, () => {
  logger.info(`Server is running on port ${process.env.PORT || 5000}`);
});
