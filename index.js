const express = require("express");
const app = express();
const path = require("path");
const http = require("http");
const port = process.env.PORT || 4000;
const mongoose = require("mongoose");
const env = require("dotenv");
env.config();
const cors = require("cors");

// Mongoose model
const { Product } = require("./models/Product");

// Middleware
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(cors({
  origin: process.env.CORS_ORIGIN,
  credentials: true,
}));

// Routes
const ProductRoutes = require("./routes/ProductRoutes");
app.use("/product", ProductRoutes);

// ✅ Server Time API
app.get("/", (req, res) => {
  const now = new Date();

  const options = {
    timeZone: "Asia/Kolkata",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  };

  // Get the IST time string
  const istString = now.toLocaleString("en-IN", options); // "04/08/2025, 03:50:30 pm"

  const [datePart, timePart] = istString.split(", ");

  // Convert from "04/08/2025" → "04-08-2025"
  const formattedDate = datePart.replace(/\//g, "-");

  res.json({
    date: formattedDate,                // "04-08-2025"
    time: timePart.toUpperCase(),       // "03:50:30 PM"
    datetime: `${formattedDate} ${timePart.toUpperCase()}` // "04-08-2025 03:50:30 PM"
  });
});


// ✅ Connect MongoDB
async function main() {
  try {
    await mongoose.connect(process.env.MONGO_DB_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log("MongoDB connected");
  } catch (err) {
    console.error("MongoDB connection failed:", err);
  }
}
main();

// ✅ Start Server
const httpServer = http.createServer(app);
httpServer.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
