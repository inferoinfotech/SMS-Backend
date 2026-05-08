const {
  addExpanse,
  editExpanse,
  deleteExpanse,
  getExpanse,
} = require("../controllers/expanse.controller");
const protect = require("../middleware/auth.middleware");

const router = require("express").Router();

router.post("/add", protect, addExpanse);
router.put("/edit/:id", protect, editExpanse);
router.delete("/delete/:id", protect, deleteExpanse);
router.get("/get", protect, getExpanse);

module.exports = router;