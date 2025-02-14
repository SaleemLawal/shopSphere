import express from "express";
import { verifyToken, isAdmin } from "../middlewares/auth.middleware.js";
import {
  placeOrder,
  getUserOrders,
  getOrder,
  getAllOrders,
  updateOrderStatus,
  deleteOrder,
} from "../controllers/order.js";
const router = express.Router();

// User routes
router.use(verifyToken);
router.route("/").post(placeOrder).get(getUserOrders);
router.get("/:id", getOrder);

// Admin routes
router.use(verifyToken, isAdmin);
router.route("/:id").put(updateOrderStatus).delete(deleteOrder);
router.get("/all", getAllOrders);

export default router;
