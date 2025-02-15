import Order from "../models/Order.js";
import Payment from "../models/Payment.js";
import Stripe from "stripe";
import { handleError } from "../middlewares/error.middleware.js";
import dotenv from "dotenv";
dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const initiatePayment = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { orderId, method } = req.body;

    // fetch the order and validate ownership
    const order = await Order.findOne({ _id: orderId, user: userId });
    if (!order) {
      return handleError(res, 404, "Order not found");
    }

    // Validate order status and payment status
    if (order.paymentStatus !== "not_charged") {
      return handleError(res, 400, "Order already paid or being processed");
    }

    // Create Stripe payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(order.totalAmount * 100),
      currency: "usd",
      payment_method_types: ["card"],
      shipping: {
        name: order.shippingAddress.name,
        address: {
          line1: order.shippingAddress.street,
          city: order.shippingAddress.city,
          state: order.shippingAddress.state,
          postal_code: order.shippingAddress.zip,
          country: order.shippingAddress.country,
        },
      },
      metadata: { orderId: order._id.toString(), userId: userId },
      confirm: true,
      payment_method: "pm_card_visa",
    });

    // Create payment record
    const payment = new Payment({
      user: userId,
      order: orderId,
      amount: order.totalAmount,
      paymentMethod: method,
      transactionId: paymentIntent.id,
    });

    order.status = "processing";

    await Promise.all([payment.save(), order.save()]);

    return res.status(201).json({
      status: "success",
      message: "Payment initiated successfully",
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    return handleError(res, 400, error.message);
  }
};

export const verifyPayment = async (req, res, next) => {
  try {
    const { paymentIntentId } = req.body;
    const userId = req.user.id;

    if (!paymentIntentId) {
      return handleError(res, 400, "PaymentIntent ID is required");
    }

    // Retrieve the payment intent from Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    if (!paymentIntent) {
      return handleError(res, 404, "Invalid PaymentIntent ID");
    }

    // Verify payment ownership
    if (paymentIntent.metadata.userId !== userId) {
      return handleError(res, 403, "Unauthorized access to payment");
    }

    // Find payment and order together
    const [payment, order] = await Promise.all([
      Payment.findOne({
        transactionId: paymentIntentId,
        user: userId,
      }),
      Order.findById(paymentIntent.metadata.orderId),
    ]);

    if (!payment || !order) {
      return handleError(res, 404, "Payment or order not found");
    }

    // Update statuses based on Stripe payment status
    switch (paymentIntent.status) {
      case "succeeded":
        payment.paymentStatus = "completed";
        order.paymentStatus = "charged";
        order.status = "processing";

        break;
      case "requires_payment_method":
        payment.paymentStatus = "failed";
        order.paymentStatus = "not_charged";
        break;
      case "processing":
        payment.paymentStatus = "processing";
        order.paymentStatus = "processing";
        break;
      default:
        return handleError(
          res,
          400,
          `Unexpected payment status: ${paymentIntent.status}`
        );
    }

    // Save updates
    await Promise.all([payment.save(), order.save()]);

    return res.status(200).json({
      status: paymentIntent.status === "succeeded" ? "success" : "fail",
      message:
        paymentIntent.status === "succeeded"
          ? "Payment verified successfully"
          : "Payment verification failed",
      data: {
        paymentStatus: payment.paymentStatus,
        orderStatus: order.status,
      },
    });
  } catch (error) {
    if (error.type === "StripeError") {
      return handleError(
        res,
        400,
        `Payment verification failed: ${error.message}`
      );
    }
    return handleError(res, 500, "Internal server error");
  }
};
