const express = require("express");
const router = express.Router();
const { ensureAuthenticated } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");
const fileController = require("../controllers/fileController");

router.post(
  "/upload",
  ensureAuthenticated,
  upload.single("file"),
  fileController.uploadFile
);
router.get("/:id", ensureAuthenticated, fileController.getFileDetails);
router.get("/:id/download", ensureAuthenticated, fileController.downloadFile);

module.exports = router;
