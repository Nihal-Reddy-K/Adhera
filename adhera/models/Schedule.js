const mongoose = require("mongoose");

const scheduleSchema = new mongoose.Schema(
  {
    deviceId: {
      type: String,
      required: true,
      default: "demobox01",
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

    dosage: {
      type: String,
      required: true,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Schedule", scheduleSchema);