const { addProduct,addDummyData, fetchCombinedProducts, searchProducts, filterProducts, quickEditProduct, bulkEditProducts, fetchProducts, fetchMaterials, fetchGrades, EditProductDetails, searchFilter } = require("../controllers/Product");

const router = require("express").Router();

router.post("/add-Combinedproduct", addProduct);
router.post("/addDummy-product", addDummyData);
router.get("/fetch-Combinedproducts", fetchCombinedProducts);
router.get("/fetch-Products", fetchProducts);
router.get("/fetch-Materials", fetchMaterials);
router.get("/fetch-Grades", fetchGrades);
router.get("/search-products", searchProducts);
router.post("/filter-products", filterProducts);
router.patch("/quick-edit", quickEditProduct);
router.patch("/details-edit", EditProductDetails);
router.patch("/bulk-edit", bulkEditProducts);
router.post("/search_filter", searchFilter);

module.exports = router;
