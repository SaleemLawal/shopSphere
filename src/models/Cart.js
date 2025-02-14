import { Schema, model } from "mongoose";

const cartSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User is required"],
      unique: true,
    },
    items: [
      {
        product: {
          type: Schema.Types.ObjectId,
          ref: "Product",
          required: [true, "Product is required"],
        },
        quantity: {
          type: Number,
          required: [true, "Quantity is required"],
          min: [1, "Quantity must be at least 1"],
          default: 1,
        },
      },
    ],
    totalPrice: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

cartSchema.pre("save", async function (next) {
  await this.populate("items.product");

  this.totalPrice = this.items
    .reduce((total, item) => {
      const productPrice =
        item.product.price * (1 - item.product.discount / 100);
      return total + productPrice * item.quantity;
    }, 0)
    .toFixed(2);
  next();
});

const Cart = model("Cart", cartSchema);
export default Cart;
