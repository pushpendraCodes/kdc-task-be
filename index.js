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
  const istOffset = 5.5 * 60 * 60 * 1000;
  const istTime = new Date(now.getTime() + istOffset - now.getTimezoneOffset() * 60000);

  res.json({
    utc: now.toISOString(),
    ist: istTime.toISOString(),
    readableIST: istTime.toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }),
    timestamp: now.getTime()
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
