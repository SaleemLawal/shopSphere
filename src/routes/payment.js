import { Router } from "express";
import { verifyToken } from "../middlewares/auth.middleware.js";
import { initiatePayment, verifyPayment } from "../controllers/payment.js";

const router = Router();

router.use(verifyToken);

router.post("/", initiatePayment).post("/verify", verifyPayment);

export default router;
