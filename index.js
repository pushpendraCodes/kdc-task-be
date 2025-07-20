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

app.get("/", (req, res) => {
  const now = new Date();

  const indianDate = now.toLocaleDateString("en-IN", {
    timeZone: "Asia/Kolkata",
  });

  const indianTime = now.toLocaleTimeString("en-IN", {
    timeZone: "Asia/Kolkata",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  res.send(`we are 19 — Date: ${indianDate}, Time: ${indianTime}`);
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

