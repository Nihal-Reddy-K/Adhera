require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");

const Schedule = require("./models/Schedule");
const DoseLog = require("./models/DoseLog");

const app = express();

// MongoDB connection
const mongoURI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/adhera";
mongoose
  .connect(mongoURI)
  .then(() => console.log("MongoDB connected successfully"))
  .catch((err) => console.log("MongoDB connection error:", err));

// EJS setup
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));

// Home
app.get("/", (req, res) => {
  res.redirect("/dashboard");
});

// Dashboard
app.get("/dashboard", async (req, res) => {
  try {
    const schedules = await Schedule.find().sort({ createdAt: -1 });
    const logs = await DoseLog.find().sort({ createdAt: -1 }).limit(10);

    const totalLogs = await DoseLog.countDocuments();
    const takenCount = await DoseLog.countDocuments({ status: "Taken" });
    const missedCount = await DoseLog.countDocuments({ status: "Missed" });
    const pendingCount = await DoseLog.countDocuments({ status: "Pending" });

    const adherence =
      totalLogs === 0 ? 0 : Math.round((takenCount / totalLogs) * 100);

    res.render("dashboard", {
      schedules,
      logs,
      totalLogs,
      takenCount,
      missedCount,
      pendingCount,
      adherence,
    });
  } catch (err) {
    console.log(err);
    res.status(500).send("Dashboard error");
  }
});

// Schedules page
app.get("/schedules", async (req, res) => {
  try {
    const schedules = await Schedule.find().sort({ createdAt: -1 });
    res.render("schedules", { schedules });
  } catch (err) {
    console.log(err);
    res.status(500).send("Schedules page error");
  }
});

// Create schedule
app.post("/schedules", async (req, res) => {
  try {
    const { deviceId, medicineName, slot, scheduledTime, dosage } = req.body;

    await Schedule.create({
      deviceId,
      medicineName,
      slot,
      scheduledTime,
      dosage,
    });

    res.redirect("/schedules");
  } catch (err) {
    console.log(err);
    res.status(500).send("Create schedule error");
  }
});

// Delete schedule
app.delete("/schedules/:id", async (req, res) => {
  try {
    await Schedule.findByIdAndDelete(req.params.id);
    res.redirect("/schedules");
  } catch (err) {
    console.log(err);
    res.status(500).send("Delete schedule error");
  }
});

// Logs page
app.get("/logs", async (req, res) => {
  try {
    const logs = await DoseLog.find().sort({ createdAt: -1 });
    res.render("logs", { logs });
  } catch (err) {
    console.log(err);
    res.status(500).send("Logs page error");
  }
});

// Demo log entry from website
app.post("/logs/demo", async (req, res) => {
  try {
    const { deviceId, medicineName, slot, scheduledTime, status } = req.body;

    await DoseLog.create({
      deviceId,
      medicineName,
      slot,
      scheduledTime,
      status,
      takenAt: status === "Taken" ? new Date() : null,
      missedAt: status === "Missed" ? new Date() : null,
    });

    res.redirect("/logs");
  } catch (err) {
    console.log(err);
    res.status(500).send("Demo log error");
  }
});

// ESP32 fetch schedules
app.get("/api/device/:deviceId/schedules", async (req, res) => {
  try {
    const schedules = await Schedule.find({
      deviceId: req.params.deviceId,
      isActive: true,
    }).sort({ createdAt: -1 });

    res.json(schedules);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Failed to fetch schedules" });
  }
});

// ESP32 send dose log
app.post("/api/device/log", async (req, res) => {
  try {
    const { deviceId, medicineName, slot, scheduledTime, status } = req.body;

    const log = await DoseLog.create({
      deviceId,
      medicineName,
      slot,
      scheduledTime,
      status,
      takenAt: status === "Taken" ? new Date() : null,
      missedAt: status === "Missed" ? new Date() : null,
    });

    res.json({
      message: "Dose log saved successfully",
      log,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Failed to save dose log" });
  }
});

// Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Adhera is running on http://localhost:${PORT}`);
});