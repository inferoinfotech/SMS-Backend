const router = require("express").Router();
const { addNote, editNote, deleteNote, getNote } = require("../controllers/note.controller");
const protect = require("../middleware/auth.middleware");

router.post("/add", protect, addNote);
router.put("/edit/:id", protect, editNote);
router.delete("/delete/:id", protect, deleteNote);
router.get("/get", protect, getNote);

module.exports = router;
