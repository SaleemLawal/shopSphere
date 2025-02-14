import { handleError } from "../middlewares/error.middleware.js";
import Cart from "../models/Cart.js";

const populateConfig = {
  path: "items.product",
  select: "name price description",
};

export const GetCart = async (req, res, next) => {
  // get cart of the user
  try {
    const userId = req.user.id;
    // fetch cart from the database by id
    const cart = await Cart.findOne({ user: userId }).populate(populateConfig);
    if (!cart) {
      return res.status(200).json({
        status: "success",
        message: "Cart is empty",
        quantity: 0,
        data: { items: [] },
      });
    }
    return res.status(200).json({
      status: "success",
      message: "Cart fetched successfully",
      quantity: cart.items.reduce((acc, item) => acc + item.quantity, 0),
      data: cart,
    });
  } catch (error) {
    handleError(res, 404, error.message);
  }
};

export const AddToCart = async (req, res, next) => {
  try {
    console.log(req.body);
    const { productId, quantity } = req.body;

    const userId = req.user.id;

    let cart = await Cart.findOne({ user: userId });

    if (!cart) {
      // Create new cart
      cart = new Cart({
        user: userId,
        items: [
          {
            product: productId,
            quantity: quantity || 1,
          },
        ],
      });
    } else {
      // Check if product already exists in cart
      const existingItem = cart.items.find(
        (item) => item.product.toString() === productId
      );

      if (existingItem) {
        existingItem.quantity += quantity || 1;
      } else {
        cart.items.push({
          product: productId,
          quantity: quantity || 1,
        });
      }
    }

    await cart.save();

    const populatedCart = await Cart.findById(cart._id).populate(
      populateConfig
    );

    return res.status(201).json({
      status: "success",
      message: cart.isNew
        ? "Cart created successfully"
        : "Item added to cart successfully",
      quantity: cart.items.reduce((acc, item) => acc + item.quantity, 0),

      data: { cart: populatedCart },
    });
  } catch (error) {
    handleError(res, 400, error.message);
  }
};

export const DeleteCartItem = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const { quantity = 1 } = req.body;
    const userId = req.user.id;

    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      return handleError(res, 404, "Cart not found");
    }

    const itemIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId
    );

    if (itemIndex === -1) {
      return handleError(res, 404, "Item not found in cart");
    }

    const item = cart.items[itemIndex];

    // If quantity to remove >= item quantity or no quantity specified, remove entire item
    if (quantity >= item.quantity) {
      cart.items.splice(itemIndex, 1);
    } else {
      // Decrease the quantity
      item.quantity -= quantity;
    }

    await cart.save();
    const populatedCart = await Cart.findById(cart._id).populate(
      populateConfig
    );

    return res.status(200).json({
      status: "success",
      message: "Item updated in cart successfully",
      quantity: cart.items.reduce((acc, item) => acc + item.quantity, 0),
      data: { cart: populatedCart },
    });
  } catch (error) {
    handleError(res, 400, error.message);
  }
};
