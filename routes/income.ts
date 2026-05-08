const express = require("express");
const router = express.Router();
const {
  addIncome,
  editIncome,
  deleteIncome,
  getIncome,
} = require("../controllers/income.controller");
const protect = require("../middleware/auth.middleware");
router.post("/add-income", protect, addIncome);
router.put("/edit-income/:id", protect, editIncome);
router.delete("/delete-income/:id", protect, deleteIncome);
router.get("/get-income", protect, getIncome);
module.exports = router;