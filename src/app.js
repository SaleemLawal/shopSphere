import express from "express";
import morgan from "morgan";
import productRouter from "./routes/product.js";
import userRouter from "./routes/user.js";
import cartRouter from "./routes/cart.js";
import orderRouter from "./routes/order.js";

export const app = express();
app.use(express.json());
app.use(morgan("dev"));

app.use("/api/v1/products", productRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/cart", cartRouter);
app.use("/api/v1/orders", orderRouter);
