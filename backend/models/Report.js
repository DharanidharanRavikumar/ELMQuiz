const mongoose = require("mongoose");

const ReportSchema = new mongoose.Schema({
  name: { type: String, required: true },
  rollNumber: { type: String, required: true },
  gender: { type: String, required: true },
  isFirstGraduate: { type: Boolean, required: true },
  hsPercentage: { type: Number, required: true },
  futureIdea: { type: String, required: true },
  generatedReport: { type: String, required: true }, // Store full report as text
}, { timestamps: true });

// Prevent re-registering model in development
const Report = mongoose.models.Report || mongoose.model("Report", ReportSchema);

module.exports = Report;
