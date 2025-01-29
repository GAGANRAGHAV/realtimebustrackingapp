const mongoose = require("mongoose");

const tripSchema = new mongoose.Schema({
  driverdetails: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  busId: { type: String, required: true },
  source: { type: String, required: true },
  destinations: [{ type: String, required: true }],
  route: [{ lat: Number, lng: Number }],
  startTime: { type: Date, default: Date.now },
  endTime: { type: Date },
  status: { type: String, enum: ["ongoing", "completed", "cancelled"], default: "ongoing" },
});

module.exports = mongoose.model("Trip", tripSchema);
