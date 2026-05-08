const router = require("express").Router();
const { addFacility, editFacility, deleteFacility, getFacility } = require("../controllers/facility.controller");
const protect = require("../middleware/auth.middleware");

router.post("/add", protect, addFacility);
router.put("/edit/:id", protect, editFacility);
router.delete("/delete/:id", protect, deleteFacility);
router.get("/get", protect, getFacility);

module.exports = router;