const express = require("express");
const router = express.Router();
const { ensureAuthenticated } = require("../middleware/authMiddleware");
const folderController = require("../controllers/folderController");

router.post("/create", ensureAuthenticated, folderController.createFolder);
router.get("/:id", ensureAuthenticated, folderController.getFolderContents);

module.exports = router;
