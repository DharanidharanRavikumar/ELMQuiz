require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors"); // Import cors
const reportRoutes = require("./routes/report");
const authRoutes = require("./routes/auth");

const app = express();

// Use CORS middleware
app.use(cors()); // Allows requests from all origins by default

app.use(express.json());
app.use("/api/report", reportRoutes);
app.use("/api/auth", authRoutes);

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("Could not connect to MongoDB:", err));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
