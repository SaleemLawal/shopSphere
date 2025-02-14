import express from "express";
import { verifyToken } from "../middlewares/auth.middleware.js";
import { AddToCart, DeleteCartItem, GetCart } from "../controllers/cart.js";

const router = express.Router();

router.use(verifyToken);
router.route("/").post(AddToCart).get(GetCart);
router.delete("/:productId", DeleteCartItem);

export default router;
