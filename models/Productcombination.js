const mongoose = require("mongoose");
const ProductCombinationSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  material: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Material",
    required: true,
  },

  gradeIds: [
    { type: mongoose.Schema.Types.ObjectId, ref: "Grade", required: true },
  ],
  price: { type: Number, default: 0 },
  currency: { type: String, default: "INR" },
  shape: { type: String, default: "" },
  length: { type: String, default: "" },
  thickness: { type: String, default: "" },
  unit: { type: String, default: "kg" },
  surfaceFinish: { type: String, default: "" },
  outsideDia: { type: String, default: "" },
});

const ProductCombination = mongoose.model(
  "ProductCombination",
  ProductCombinationSchema
);

module.exports = { ProductCombination };
