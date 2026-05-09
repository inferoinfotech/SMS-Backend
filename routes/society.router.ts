const express = require("express");
const societyRouter = express.Router();
const {
  createSociety,
  getAllSocieties,
} = require("../controllers/socity.controller");
const validate = require("../middleware/validate.middleware");
const { createSocietySchema } = require("../schemas/society.schema");
const protect = require("../middleware/auth.middleware");

societyRouter.post("/create", validate(createSocietySchema), createSociety);
societyRouter.get("/get", getAllSocieties);

module.exports = societyRouter;
