import { Schema, model } from "mongoose";

const orderSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User is required"],
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
        },
        priceAtOrder: {
          type: Number,
        },
      },
    ],
    totalAmount: {
      type: Number,
      required: true,
    },
    shippingAddress: {
      name: { type: String, required: true, default: "John Doe", trim: true },
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      zip: { type: String, required: true },
      country: { type: String, required: true, default: "USA" },
    },
    paymentMethod: {
      type: String,
      required: true,
      enum: ["credit_card", "debit_card"],
    },
    paymentStatus: {
      type: String,
      enum: ["charged", "not_charged", "refunded"],
      default: "not_charged",
    },
    status: {
      type: String,
      enum: ["pending", "processing", "shipped", "delivered", "cancelled"],
      default: "pending",
    },
    statusHistory: [
      {
        status: String,
        date: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    trackingNumber: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
    },
    toObject: {
      virtuals: true,
    },
  }
);

orderSchema.pre("save", async function (next) {
  if (this.isModified("items")) {
    await this.populate("items.product");

    this.items.forEach((item) => {
      const product = item.product;
      const discountedPrice =
        product.price * (1 - (product.discount || 0) / 100);
      item.priceAtOrder = discountedPrice.toFixed(2);
    });

    // Calculate total amount
    this.totalAmount = this.items
      .reduce((sum, item) => sum + item.priceAtOrder * item.quantity, 0)
      .toFixed(2);
  }

  // Add status change to history
  if (this.isModified("status")) {
    this.statusHistory.push({
      status: this.status,
      date: new Date(),
    });
  }

  // Generate tracking number
  if (this.status === "shipped" && !this.trackingNumber) {
    this.trackingNumber = Math.floor(
      100000 + Math.random() * 900000
    ).toString();
  }

  next();
});

// // Validate status transitions
// orderSchema.pre("save", function (next) {
//   const validTransitions = {
//     pending: ["processing", "cancelled"],
//     processing: ["shipped", "cancelled"],
//     shipped: ["delivered"],
//     delivered: [],
//     cancelled: [],
//   };

//   if (this.isModified("status") && !this.isNew) {
//     const oldStatus = this._original.status;
//     const newStatus = this.status;

//     if (!validTransitions[oldStatus].includes(newStatus)) {
//       return next(
//         new Error(`Invalid status transition from ${oldStatus} to ${newStatus}`)
//       );
//     }
//   }
//   next();
// });

const Order = model("Order", orderSchema);
export default Order;
