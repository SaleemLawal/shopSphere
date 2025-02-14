import express from "express";
import {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../controllers/product.js";
import { isAdmin } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.route("/").get(getProducts).post(isAdmin, createProduct);
router
  .route("/:id")
  .get(getProduct)
  .put(isAdmin, updateProduct)
  .delete(isAdmin, deleteProduct);

export default router;
