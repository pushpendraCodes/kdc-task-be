
const mongoose = require("mongoose");
const MaterialSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
  });

  const Material = mongoose.model("Material", MaterialSchema);
  module.exports = {  Material };
