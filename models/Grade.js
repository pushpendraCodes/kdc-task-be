
const mongoose = require("mongoose");
const GradeSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
  });

  const Grade = mongoose.model("Grade", GradeSchema);

  module.exports = {  Grade };