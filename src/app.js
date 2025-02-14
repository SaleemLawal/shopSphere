import express from "express";
import morgan from "morgan";
import productRouter from "./routes/product.js";
import userRouter from "./routes/user.js";

export const app = express();
app.use(express.json());
app.use(morgan("dev"));

app.use("/api/v1/products", productRouter);
app.use("/api/v1/users", userRouter);
