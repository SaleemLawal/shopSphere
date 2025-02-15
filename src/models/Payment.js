import { Schema, model } from "mongoose";

const paymentSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User is required"],
    },
    order: {
      type: Schema.Types.ObjectId,
      ref: "Order",
      required: [true, "Order is required"],
      unique: true,
    },
    amount: {
      type: Number,
      required: [true, "Amount is required"],
      min: [0, "Amount cannot be negative"],
    },
    paymentMethod: {
      type: String,
      required: [true, "Payment method is required"],
      enum: ["credit_card", "debit_card", "paypal", "apple_pay", "google_pay"],
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "processing", "completed", "failed", "refunded"],
      default: "pending",
    },
    transactionId: {
      type: String,
      unique: true,
      sparse: true,
    },
    paymentDate: {
      type: Date,
      default: Date.now,
    },
    refundReason: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

paymentSchema.pre("save", async function (next) {
  if (this.isNew || this.isModified("amount")) {
    const order = await this.model("Order").findById(this.order);
    if (order && order.totalAmount !== this.amount) {
      next(new Error("Payment amount does not match order amount"));
    }
  }

  if (this.paymentStatus === "refunded" && !this.refundReason) {
    return next(
      new Error("Refund reason is required when payment is refunded")
    );
  }
  next();
});

const Payment = model("Payment", paymentSchema);
export default Payment;
