const express = require("express");
const societyRouter = express.Router();
const {
  createSociety,
  getAllSocieties,
} = require("../controllers/socity.controller");

societyRouter.post("/create", createSociety);
societyRouter.get("/get", getAllSocieties);

module.exports = societyRouter;
