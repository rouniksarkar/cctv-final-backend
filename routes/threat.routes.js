const express = require("express");

const {
  createAlert,
  getCameraAlerts,
  getAlertById,
} = require("../controllers/threat.controller.js");
const uploadAlertImage = require("../middleware/image-upload.middleware.js");

const router = express.Router();

router.post("/alerts", uploadAlertImage.single("image"), createAlert);

router.get("/alerts", getCameraAlerts);

router.get("/alerts/:id", getAlertById);

module.exports = router;
