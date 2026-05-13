const {
  addExpanse,
  editExpanse,
  deleteExpanse,
  getExpanse,
} = require("../controllers/expanse.controller");
const protect = require("../middleware/auth.middleware");
const upload = require("../middleware/multer.middleware");

const router = require("express").Router();

router.post("/add", protect, upload.single("uploadBill"), addExpanse);
router.put("/edit/:id", protect, upload.single("uploadBill"), editExpanse);
router.delete("/delete/:id", protect, deleteExpanse);
router.get("/get", protect, getExpanse);

module.exports = router;