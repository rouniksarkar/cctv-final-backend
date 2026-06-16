const mongoose = require("mongoose");

const alertSchema = new mongoose.Schema(
  {
    cameraId: {
      type: String,
      required: true,
      trim: true,
    },

    alertType: {
      type: String,
      required: true,
      enum: [
        "knife",
        "gun",
        "abnormal_movement",
        "face_detected",
        "suspicious_person",
        "other",
      ],
    },

    score: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    imageUrl: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Alert", alertSchema);