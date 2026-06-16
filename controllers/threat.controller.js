const Alert = require("../models/threat.model.js");


// Create Alert
exports.createAlert = async (req, res) => {
  try {
    const {
      cameraId,
      alertType,
      score,
      description,
      imageUrl,
    } = req.body;

    const alert = await Alert.create({
      cameraId,
      alertType,
      score,
      description,
      imageUrl,
    });

    res.status(201).json({
      success: true,
      message: "Alert created successfully",
      payload: alert,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};



// Get Alerts By Camera
exports.getCameraAlerts = async (req, res) => {
  try {
    const { cameraId } = req.query;

    const alerts = await Alert.find({
      cameraId,
    }).sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      count: alerts.length,
      payload: alerts,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};



// Get Single Alert
exports.getAlertById = async (req, res) => {
  try {
    const alert = await Alert.findById(req.params.id);

    if (!alert) {
      return res.status(404).json({
        success: false,
        message: "Alert not found",
      });
    }

    res.status(200).json({
      success: true,
      payload: alert,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};