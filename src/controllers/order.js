import Order from "../models/Order.js";
import Cart from "../models/Cart.js";
import Product from "../models/Product.js";
import { handleError } from "../middlewares/error.middleware.js";

const populateConfig = {
  path: "items.product",
  select: "name price description",
};

// logged in user
export const placeOrder = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { shippingAddress, paymentMethod } = req.body;

    const cart = await Cart.findOne({ user: userId }).populate(populateConfig);
    if (!cart || cart.items.length === 0) {
      return handleError(res, 400, "Cart is empty");
    }

    // Check stock availability first
    for (const item of cart.items) {
      const product = await Product.findById(item.product._id);
      if (!product || product.stock < item.quantity) {
        return handleError(res, 400, `Insufficient stock for ${product.name}`);
      }
    }

    const order = new Order({
      user: userId,
      items: cart.items.map((item) => ({
        product: item.product._id,
        quantity: item.quantity,
      })),
      totalAmount: cart.totalPrice,
      shippingAddress,
      paymentMethod,
    });

    // Update stock levels
    await Promise.all(
      cart.items.map(async (item) => {
        const product = await Product.findById(item.product._id);
        product.stock -= item.quantity;
        return product.save({ validateBeforeSave: false });
      })
    );

    await order.save();
    await Cart.findOneAndDelete({ user: userId });

    const populatedOrder = await Order.findById(order._id).populate(
      populateConfig
    );

    return res.status(201).json({
      status: "success",
      message: "Order placed successfully",
      data: { order: populatedOrder },
    });
  } catch (error) {
    return handleError(res, 400, error.message);
  }
};

export const getUserOrders = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const orders = await Order.find({ user: userId })
      .populate(populateConfig)
      .sort({ createdAt: -1 });

    return res.status(200).json({
      status: "success",
      message: "Orders retrieved successfully",
      result: orders.length,
      data: { orders },
    });
  } catch (error) {
    handleError(res, 400, error.message);
  }
};

export const getOrder = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const orderId = req.params.id;
    const order = await Order.findOne({ _id: orderId, user: userId }).populate(
      populateConfig
    );
    if (!order) {
      return handleError(res, 404, "Order not found");
    }
    return res.status(200).json({
      status: "success",
      message: "Order retrieved successfully",
      data: { order },
    });
  } catch (error) {
    handleError(res, 400, error.message);
  }
};

// ADMIN
export const getAllOrders = async (req, res, next) => {
  try {
    const orders = await Order.find().populate(populateConfig);
    return res.status(200).json({
      status: "success",
      message: "Orders retrieved successfully",
      result: orders.length,
      data: { orders },
    });
  } catch (error) {
    handleError(res, 400, error.message);
  }
};

export const updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const orderId = req.params.id;

    let order = await Order.findById(orderId);
    if (!order) {
      return handleError(res, 404, "Order not found");
    }

    order = await Order.findByIdAndUpdate(
      orderId,
      { status },
      { new: true, runValidators: true }
    ).populate(populateConfig);

    return res.status(200).json({
      status: "success",
      message: "Order status updated successfully",
      data: { order },
    });
  } catch (error) {
    return handleError(res, 400, error.message);
  }
};

export const deleteOrder = async (req, res, next) => {
  try {
    const orderId = req.params.id;
    const order = await Order.findById(orderId);

    if (!order) {
      return handleError(res, 404, "Order not found");
    }

    if (order.status !== "pending") {
      return handleError(res, 400, "Cannot delete non-pending order");
    }

    await Order.findByIdAndDelete(orderId);

    return res.status(204).json({
      status: "success",
      message: "Order deleted successfully",
      data: null,
    });
  } catch (error) {
    return handleError(res, 400, error.message);
  }
};
