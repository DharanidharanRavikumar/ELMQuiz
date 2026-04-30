const mongoose = require("mongoose");

const ReportContentSchema = new mongoose.Schema({
  category: { type: String, required: true },
  scoreRange: { type: String, required: true }, // e.g., "high", "moderate", "low"
  paragraph: { type: String, required: true },
});

module.exports = mongoose.model("ReportContent", ReportContentSchema);
