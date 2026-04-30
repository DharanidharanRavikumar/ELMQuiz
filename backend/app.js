const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors"); // Import cors
const reportRoutes = require("./routes/report");

const app = express();

// Use CORS middleware
app.use(cors()); // Allows requests from all origins by default

app.use(express.json());
app.use("/api/report", reportRoutes);

// Connect to MongoDB
mongoose.connect("mongodb+srv://dharanidharanr1211:lFBhKCPkPaBdgeM1@clustermcq.dv7vd.mongodb.net/?retryWrites=true&w=majority&appName=Clustermcq")
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("Could not connect to MongoDB:", err));

const PORT = 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
