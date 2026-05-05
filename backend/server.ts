const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const connectDB = require("./config/db");
require("dotenv").config();


const app = express();
app.use(cors());
app.use(express.json());

connectDB();

app.get("/", (req: any, res: any) => {
    res.send("Hello World!");
});

app.listen(process.env.PORT || 5000, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
});