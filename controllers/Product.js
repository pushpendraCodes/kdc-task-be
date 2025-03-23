const { default: mongoose } = require("mongoose");
const { Grade } = require("../models/Grade");
const { Material } = require("../models/Material");
const { Product } = require("../models/Product");
const { ProductCombination } = require("../models/Productcombination");


const addProduct = async (req, res) => {
  try {
    const { productId, materialId, gradeIds } = req.body;
console.log(gradeIds,"gradeIds")
    const productCombination = new ProductCombination({
      productId,
      material:  materialId ,
      gradeIds,



    });

    await productCombination.save();

    const productPopulate = await ProductCombination.aggregate([
      {
        $match: { _id: new mongoose.Types.ObjectId(productCombination._id) }, // Filter by ID
      },
      {
        $lookup: {
          from: "products", // Name of the "Product" collection
          localField: "productId",
          foreignField: "_id",
          as: "product",
        },
      },
      {
        $unwind: "$product", // Convert array to object
      },
      {
        $lookup: {
          from: "materials", // Name of the "Material" collection
          localField: "material",
          foreignField: "_id",
          as: "material",
        },
      },
      {
        $unwind: "$material", // Convert array to object
      },
      {
        $lookup: {
          from: "grades", // Name of the "Grade" collection
          localField: "gradeIds",
          foreignField: "_id",
          as: "grades",
        },
      },
      {
        $project: {
          _id: 1,
          product: { _id: 1, name: 1 },
          material: { _id: 1, name: 1 },
          grades: { _id: 1, name: 1 },
          price: 1,
          currency: 1,
          shape: 1,
          length: 1,
          thickness: 1,
          unit: 1,
          surfaceFinish: 1,
          outsideDia: 1,
        },
      },
    ]);

    if (!productPopulate.length) {
      return res.status(404).json({ error: "Product  not found" });
    }
console.log(productPopulate,"productPopulate")





    res.status(201).json({ message: "Product added successfully",productCombination:productPopulate  });
  } catch (error) {
    res.status(500).json({ message: "Error adding product", error: error.message });
  }
};


const searchFilter  =async(req,res)=>{
  try {
    const { query, product, material } = req.query;
console.log(req.query,"jb")
    // Step 1: Fetch all products with populated data
    const products = await ProductCombination.aggregate([
        {
            $lookup: {
                from: "products",
                localField: "productId",
                foreignField: "_id",
                as: "product",
            },
        },
        { $unwind: "$product" },

        {
            $lookup: {
                from: "materials",
                localField: "material",
                foreignField: "_id",
                as: "material",
            },
        },
        { $unwind: "$material" },

        {
            $lookup: {
                from: "grades",
                localField: "gradeIds",
                foreignField: "_id",
                as: "grades",
            },
        },

        {
            $project: {
                _id: 1,
                shape: 1,
                length: 1,
                thickness: 1,
                "product.name": 1,
                "material.name": 1,
                "grades.name": 1,
            },
        },
    ]);

    // Step 2: Apply search and filter logic in JavaScript
    let filteredProducts = products;
    // console.log(filteredProducts,"filteredProducts")
    if (query) {
      const queryWords = query.toLowerCase().split(" "); // Split query into words
      console.log("Search Query Words:", queryWords);

      filteredProducts = filteredProducts.filter((item) => {
          // Convert product details to a searchable string
          const searchString = [
              item.shape,
              item.length,
              item.thickness,
              item.material?.name,
              item.product?.name,
              ...(item.grades ? item.grades.map((grade) => grade?.name) : []),
          ]
              .filter(Boolean) // Remove null/undefined values
              .join(" ") // Create a searchable string
              .toLowerCase();

          // Check if any word from query matches the search string
          return queryWords.some((word) => searchString.includes(word));
      });

      console.log("Filtered Products Count (Query):", filteredProducts.length);
  }

  // Apply product & material filters together when both exist
  if (product && material) {
      filteredProducts = filteredProducts.filter(
          (item) =>
              item.product?.name?.toLowerCase().includes(product.toLowerCase()) &&
              item.material?.name?.toLowerCase().includes(material.toLowerCase())
      );
      console.log("Filtered Products Count (Product + Material):", filteredProducts.length);
  } else {
      // Case-insensitive filtering for product (if only product exists)
      if (product) {
          filteredProducts = filteredProducts.filter(
              (item) => item.product?.name?.toLowerCase().includes(product.toLowerCase())
          );
          console.log("Filtered Products Count (Product Only):", filteredProducts.length);
      }

      // Case-insensitive filtering for material (if only material exists)
      if (material) {
          filteredProducts = filteredProducts.filter(
              (item) => item.material?.name?.toLowerCase().includes(material.toLowerCase())
          );
          console.log("Filtered Products Count (Material Only):", filteredProducts.length);
      }
  }


  console.log(filteredProducts,"filteredProducts1")
    // res.json(filteredProducts);
    res.status(200).json({ filteredProducts });
} catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ message: "Server Error" });
}
}


const fetchCombinedProducts = async (req, res) => {
  try {
      const products = await ProductCombination.aggregate([
          {
              $lookup: {
                  from: "products",
                  localField: "productId",
                  foreignField: "_id",
                  as: "productData"
              }
          },
          { $unwind: "$productData" },

          {
              $lookup: {
                  from: "materials",
                  localField: "material",
                  foreignField: "_id",
                  as: "materialData"
              }
          },
          { $unwind: "$materialData" },

          {
              $lookup: {
                  from: "grades",
                  localField: "gradeIds",
                  foreignField: "_id",
                  as: "gradeData"
              }
          },

          {
              $project: {
                  _id: 1,
                  product: { _id: "$productData._id", name: "$productData.name" },
                  material: { _id: "$materialData._id", name: "$materialData.name" },
                  grades: {
                      $map: {
                          input: "$gradeData",
                          as: "grade",
                          in: { _id: "$$grade._id", name: "$$grade.name" }
                      }
                  },
                  price: 1,
                  currency: 1,
                  shape: 1,
                  length: 1,
                  thickness: 1,
                  unit:1,
                  surfaceFinish: 1,
                  outsideDia: 1,
              }
          }
      ]);

console.log(products,"products")
      res.status(200).json({ products });
  } catch (error) {
      res.status(500).json({ message: "Error fetching products", error: error.message });
  }
};


  const fetchProducts = async (req, res) => {
    try {
      const products = await Product.find()
        // .populate("productId", "name")
        // .populate("material.materialId", "name")
        // .populate("gradeIds", "name");
      res.status(200).json({ products });
    } catch (error) {
      res.status(500).json({ message: "Error fetching products", error: error.message });
    }
  };
  const fetchMaterials = async (req, res) => {
    try {
      const products = await Material.find()
        // .populate("productId", "name")
        // .populate("material.materialId", "name")
        // .populate("gradeIds", "name");
      res.status(200).json({ products });
    } catch (error) {
      res.status(500).json({ message: "Error fetching products", error: error.message });
    }
  };


  const fetchGrades = async (req, res) => {
    try {
      const products = await Grade.find()
        // .populate("productId", "name")
        // .populate("material.materialId", "name")
        // .populate("gradeIds", "name");
      res.status(200).json({ products });
    } catch (error) {
      res.status(500).json({ message: "Error fetching products", error: error.message });
    }
  };

  const searchProducts = async (req, res) => {
    try {
      const { searchText } = req.body;
      const query = {};

      if (searchText) {
        const product = await Product.findOne({ name: searchText });
        if (product) query.productId = product._id;

        const material = await Material.findOne({ name: searchText });
        if (material) query["material.materialId"] = material._id;
      }

      const products = await ProductCombination.find(query)
        .populate("productId", "name")
        .populate("material.materialId", "name")
        .populate("gradeIds", "name");
      res.status(200).json({ products });
    } catch (error) {
      res.status(500).json({ message: "Error searching products", error: error.message });
    }
  };

  const filterProducts = async (req, res) => {
    try {
      const { productName, materialName } = req.body;
      const query = {};

      if (productName) {
        const product = await Product.findOne({ name: productName });
        if (product) query.productId = product._id;
      }

      if (materialName) {
        const material = await Material.findOne({ name: materialName });
        if (material) query["material.materialId"] = material._id;
      }

      const products = await ProductCombination.find(query)
        .populate("productId", "name")
        .populate("material.materialId", "name")
        .populate("gradeIds", "name");
      res.status(200).json({ products });
    } catch (error) {
      res.status(500).json({ message: "Error filtering products", error: error.message });
    }
  };

  const quickEditProduct = async (req, res) => {
    try {
      const { id, updates } = req.body;
      console.log(id,updates,"fbh")
      const updatedProduct = await ProductCombination.findByIdAndUpdate(id, updates, { new: true });


      const productPopulate = await ProductCombination.aggregate([
        {
          $match: { _id: new mongoose.Types.ObjectId(updatedProduct._id) }, // Filter by ID
        },
        {
          $lookup: {
            from: "products", // Name of the "Product" collection
            localField: "productId",
            foreignField: "_id",
            as: "product",
          },
        },
        {
          $unwind: "$product", // Convert array to object
        },
        {
          $lookup: {
            from: "materials", // Name of the "Material" collection
            localField: "material",
            foreignField: "_id",
            as: "material",
          },
        },
        {
          $unwind: "$material", // Convert array to object
        },
        {
          $lookup: {
            from: "grades", // Name of the "Grade" collection
            localField: "gradeIds",
            foreignField: "_id",
            as: "grades",
          },
        },
        {
          $project: {
            _id: 1,
            product: { _id: 1, name: 1 },
            material: { _id: 1, name: 1 },
            grades: { _id: 1, name: 1 },
            price: 1,
            currency: 1,
            shape: 1,
            length: 1,
            thickness: 1,
            unit: 1,
            surfaceFinish: 1,
            outsideDia: 1,
          },
        },
      ]);

      if (!productPopulate.length) {
        return res.status(404).json({ error: "Product  not found" });
      }
  console.log(productPopulate,"productPopulate")


      res.status(200).json({ message: "Product updated successfully", updatedProduct: productPopulate[0] });
    } catch (error) {
      res.status(500).json({ message: "Error updating product", error: error.message });
    }
  };
  const EditProductDetails = async (req, res) => {
    try {
      const { id, updates } = req.body;
      const updatedProduct = await ProductCombination.findByIdAndUpdate(id, updates, { new: true });

      const productPopulate = await ProductCombination.aggregate([
        {
          $match: { _id: new mongoose.Types.ObjectId(updatedProduct._id) }, // Filter by ID
        },
        {
          $lookup: {
            from: "products", // Name of the "Product" collection
            localField: "productId",
            foreignField: "_id",
            as: "product",
          },
        },
        {
          $unwind: "$product", // Convert array to object
        },
        {
          $lookup: {
            from: "materials", // Name of the "Material" collection
            localField: "material",
            foreignField: "_id",
            as: "material",
          },
        },
        {
          $unwind: "$material", // Convert array to object
        },
        {
          $lookup: {
            from: "grades", // Name of the "Grade" collection
            localField: "gradeIds",
            foreignField: "_id",
            as: "grades",
          },
        },
        {
          $project: {
            _id: 1,
            product: { _id: 1, name: 1 },
            material: { _id: 1, name: 1 },
            grades: { _id: 1, name: 1 },
            price: 1,
            currency: 1,
            shape: 1,
            length: 1,
            thickness: 1,
            unit: 1,
            surfaceFinish: 1,
            outsideDia: 1,
          },
        },
      ]);

      if (!productPopulate.length) {
        return res.status(404).json({ error: "Product  not found" });
      }
  console.log(productPopulate,"productPopulate")


  res.status(200).json({ message: "Product updated successfully", updatedProduct: productPopulate[0] });
    } catch (error) {
      res.status(500).json({ message: "Error updating product", error: error.message });
    }
  };

  const bulkEditProducts = async (req, res) => {
    try {
      const { ids, updates } = req.body;
      await ProductCombination.updateMany({ _id: { $in: ids } }, updates);
      res.status(200).json({ message: "Products updated successfully" });
    } catch (error) {
      res.status(500).json({ message: "Error updating products", error: error.message });
    }
  };


  const addDummyData = async (req, res) => {
    try {
      const products = ["Pipe", "Tubing", "Rod", "Sheet", "Bar", "Plate", "Coil", "Angle", "Channel", "Beam", "Flange", "Fitting", "Valve", "Fastener", "Wire", "Strip", "Tube", "Hex Bar", "Round Bar", "Square Bar"];
      const materials = ["Stainless Steel", "Carbon Steel", "Alloy Steel", "Aluminium", "Copper", "Brass", "Nickel", "Titanium", "Duplex Steel", "Super Duplex Steel"];
      const grades = ["304", "316", "321", "410", "A105", "F11", "F22", "B16", "C22", "C276", "625", "825", "17-4PH", "2205", "2507", "6061", "7075", "C954", "C932", "CZ121"];

      for (const productName of products) {
        await Product.create({ name: productName });
      }

      for (const materialName of materials) {
        await Material.create({ name: materialName });
      }

      for (const gradeName of grades) {
        await Grade.create({ name: gradeName });
      }

      res.status(201).json({ message: "Dummy data added successfully" });
    } catch (error) {
      res.status(500).json({ message: "Error adding dummy data", error: error.message });
    }
  };




  module.exports = { addProduct,fetchMaterials, EditProductDetails,fetchGrades,fetchProducts, fetchCombinedProducts, searchProducts, filterProducts, quickEditProduct, bulkEditProducts,addDummyData,searchFilter };