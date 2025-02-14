import { handleError } from "../middlewares/error.middleware.js";
import User from "../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const registerUser = async (req, res, next) => {
  try {
    const newUser = await User.create(req.body);
    return res.status(201).json({
      status: "success",
      message: "User registered successfully",
      data: { user: newUser },
    });
  } catch (error) {
    handleError(res, 400, error.message);
  }
};

export const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return handleError(res, 404, "Invalid email");
    }

    // compare it with the input password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        status: "fail",
        message: "Invalid password",
      });
    }

    // generate jwt token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRES_IN,
      }
    );

    const userWithoutPassword = user.toObject();
    delete userWithoutPassword.password;

    return res.status(200).json({
      status: "success",
      message: "Logged in successfully",
      token,
      data: { user: userWithoutPassword },
    });
  } catch (error) {
    handleError(res, 400, error.message);
  }
};


export const getUserProfile = async (req, res, next) => {
  try {
    const user = await User.findOne({ _id: req.user.id });
    if (!user) {
      return handleError(res, 404, "User not found");
    }
    return res.status(200).json({
      status: "success",
      message: "User profile fetched successfully",
      data: { user },
    });
  } catch (error) {
    handleError(res, 400, error.message);
  }
};

export const updateUserProfile = async (req, res, next) => {
  // remove role from the body
  delete req.body.role;
  try {
    const user = await User.findByIdAndUpdate(req.user.id, req.body, {
      new: true,
      runValidators: true,
    });
    return res.status(200).json({
      status: "success",
      message: "User profile updated successfully",
      data: { user },
    });
  } catch (error) {
    handleError(res, 400, error.message);
  }
};

// ADMIN STATUS
export const getAllUsers = async (req, res, next) => {
  // assumming user is admin due to the middleware applied
  try {
    const users = await User.find().sort({ createdAt: -1 });
    return res.status(200).json({
      status: "success",
      results: users.length,
      message: "Users fetched successfully",
      data: { users },
    });
  } catch (error) {
    handleError(res, 400, error.message);
  }
};

export const getUserById = async (req, res, next) => {
  try {
    const user = await User.findOne({ _id: req.params.id });
    if (!user) {
      return handleError(res, 404, "User not found");
    }
    return res.status(200).json({
      status: "success",
      message: "User fetched successfully",
      data: { user },
    });
  } catch (error) {
    handleError(res, 400, error.message);
  }
};

export const updateUser = async (req, res, next) => {
  // only admin can update role
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!user) {
      handleError(res, 404, "User not found");
    }
    return res.status(200).json({
      status: "success",
      message: "User updated successfully",
      data: { user },
    });
  } catch (error) {
    handleError(res, 400, error.message);
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      handleError(res, 404, "User not found");
    }
    return res.status(204).json({
      status: "success",
      message: "User deleted successfully",
      data: null,
    });
  } catch (error) {
    handleError(res, 400, error.message);
  }
};
