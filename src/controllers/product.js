import Product from "../models/Product.js";
import { handleError } from "../middlewares/error.middleware.js";

export const getProducts = async (req, res, next) => {
  try {
    const products = await Product.find();
    return res.status(200).json({
      status: "Success",
      result: products.length,
      message: "Products fetched successfully",
      data: { products },
    });
  } catch (error) {
    handleError(res, 400, error.message);
  }
};

export const getProduct = async (req, res, next) => {
  try {
    const product = await Product.find({ _id: req.params.id });
    return res.status(200).json({
      status: "success",
      message: "Product fetched successfully",
      data: { product },
    });
  } catch (error) {
    handleError(res, 400, error.message);
  }
};

// Admin access only
export const createProduct = async (req, res, next) => {
  try {
    const newProduct = await Product.create(req.body);
    return res.status(201).json({
      status: "success",
      message: "Product created successfully",
      data: { product: newProduct },
    });
  } catch (error) {
    handleError(res, 400, error.message);
  }
};

// Admin access only
export const updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    return res.status(200).json({
      status: "success",
      message: "Product updated successfully",
      data: { product },
    });
  } catch (error) {
    handleError(res, 400, error.message);
  }
};

// Admin access only
export const deleteProduct = async (req, res, next) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    return res.status(204).json({
      status: "success",
      message: "Product deleted successfully",
      data: null,
    });
  } catch (error) {
    handleError(res, 400, error.message);
  }
};
