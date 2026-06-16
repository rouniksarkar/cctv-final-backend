const express = require("express");

const {
  createAlert,
  getCameraAlerts,
  getAlertById,
} = require("../controllers/threat.controller.js");

const router = express.Router();

router.post("/alerts", createAlert);

router.get("/alerts", getCameraAlerts);

router.get("/alerts/:id", getAlertById);

module.exports = router;