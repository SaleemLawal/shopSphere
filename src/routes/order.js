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
router.get("/order/:id", getOrder);

// Admin routes
router.use(isAdmin);
router.get("/admin/orders", getAllOrders);
router.route("/admin/order/:id").put(updateOrderStatus).delete(deleteOrder);
export default router;
