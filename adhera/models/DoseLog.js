const mongoose = require("mongoose");

const doseLogSchema = new mongoose.Schema(
  {
    deviceId: {
      type: String,
      required: true,
    },

    medicineName: {
      type: String,
      required: true,
    },

    slot: {
      type: String,
      enum: ["Morning", "Afternoon", "Night"],
      required: true,
    },

    scheduledTime: {
      type: String,
      required: true,
    },

    status: {
      type: String,
      enum: ["Pending", "Taken", "Missed"],
      default: "Pending",
    },

    takenAt: {
      type: Date,
      default: null,
    },

    missedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("DoseLog", doseLogSchema);