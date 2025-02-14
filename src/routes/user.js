import express from "express";
import {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
} from "../controllers/user.js";
import { isAdmin, verifyToken } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/register", registerUser).post("/login", loginUser);

// private to user
router.use("/profile", verifyToken);
router.route("/profile").get(getUserProfile).put(updateUserProfile);

// Admin endpoints
router.use(["/:id", "/"], verifyToken, isAdmin);

router.route("/").get(getAllUsers);
router.route("/:id").get(getUserById).put(updateUser).delete(deleteUser);

export default router;
