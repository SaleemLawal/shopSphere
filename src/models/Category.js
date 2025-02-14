import { Schema, model } from "mongoose";
const categorySchema = new Schema({});

const Category = model("User", categorySchema);
export default Category;
