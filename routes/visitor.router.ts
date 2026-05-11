const express = require("express");
const router = express.Router();
const { addVisitor,getAllvisitor } = require("../controllers/visitor.controller");
const protect = require("../middleware/auth.middleware");
router.post("/add",protect, addVisitor);
router.get("/get",protect,getAllvisitor);
module.exports = router;