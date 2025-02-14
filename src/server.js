import { app } from "./app.js";
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();
const port = process.env.PORT || 3001;

try {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("Connected to DB");
} catch (error) {
  console.error(error);
}

app.listen(port, () => {
  console.log("Server is running on port 3000");
});
