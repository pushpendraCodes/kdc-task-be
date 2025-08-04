const express = require("express");
const app = express();
const path = require("path");
const http = require("http");
const port = process.env.PORT || 4000;
const mongoose = require("mongoose");
const env = require("dotenv");
env.config();

const cors = require("cors");
const { Product } = require("./models/Product");
app.use(express.json({limit: "16kb"}))
app.use(express.urlencoded({extended: true, limit: "16kb"}))
app.use(express.json());
app.use(cors({
  origin: process.env.CORS_ORIGIN,
  credentials: true,

}))

const ProductRoutes = require("./routes/ProductRoutes");

const express = require('express');
const fetch = require('node-fetch'); // if using Node 18 or earlier
const app = express();
const port = 3000;

app.get('/', async (req, res) => {
  const now = Date.now();

  // Refresh if older than 15 minutes
  if (!cachedIST || now - lastFetched > 15 * 60 * 1000) {
    await updateISTTime();
  }

  // Adjust cached time with elapsed milliseconds
  const elapsed = now - lastFetched;
  const adjustedTime = new Date(cachedIST.getTime() + elapsed);

  res.json({
    istTime: adjustedTime.toISOString(),
    readable: adjustedTime.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
  });
});




  app.use("/product", ProductRoutes);

  main().catch((err) => console.log(err));

async function main() {
  mongoose
    .connect(process.env.MONGO_DB_URL, { useNewUrlParser: true })
    .then(() => {
      console.log("mongo_db connected");
    });
}

const htttpServer = http.createServer(app);
htttpServer.listen(port, () => {
  console.log("Server is running on port 4000");
});

