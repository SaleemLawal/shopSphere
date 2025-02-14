import { Schema, model } from "mongoose";

const productSchema = new Schema({
  name: {
    type: String,
    required: [true, "Product name is required"],
    minlength: [3, "Product name must be at least 3 characters long"],
    maxlength: [100, "Product name must be at most 50 characters long"],
    trim: true,
  },
  description: {
    type: String,
    required: [true, "Product description is required"],
    minlength: [10, "Product description must be at least 10 characters long"],
    maxlength: [500, "Product description must be at most 500 characters long"],
    trim: true,
  },
  price: {
    type: Number,
    required: [true, "Product price is required"],
    min: [0, "Price must be a positive number"],
    validate: {
      validator: function (v) {
        return v.toFixed(2) == v;
      },
      message: "Price must have up to 2 decimal places",
    },
  },
  discount: {
    type: Number,
    default: 0,
    min: [0, "Discount must be a positive number"],
    max: [100, "Discount cannot exceed 100%"],
  },
  stock: {
    type: Number,
    min: [0, "Stock must be a positive number"],
    default: 0,
  },
  category: {
    type: Schema.Types.ObjectId,
    ref: "Category",
    // required: [true, "Product category is required"],
  },
  brand: {
    type: String,
    required: [true, "Brand is required"],
    trim: true,
  },
  images: [
    {
      url: {
        type: String,
        required: [true, "Image URL is required"],
      },
      altText: {
        type: String,
        default: "",
      },
    },
  ],
  ratings: {
    average: {
      type: Number,
      default: 0,
      min: [0, "Rating must be at least 0"],
      max: [5, "Rating cannot exceed 5"],
    },
    count: {
      type: Number,
      default: 0,
      min: [0, "Rating count cannot be negative"],
    },
  },
  reviews: [
    {
      user: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
      rating: {
        type: Number,
        required: true,
        min: [1, "Rating must be at least 1"],
        max: [5, "Rating cannot exceed 5"],
      },
      comment: {
        type: String,
        required: [true, "Review comment is required"],
        minlength: [10, "Review must be at least 10 characters long"],
        maxlength: [1000, "Review cannot exceed 1000 characters"],
      },
      createdAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  tags: {
    type: [String],
    default: [],
    validate: {
      validator: function (v) {
        return v.length <= 10;
      },
      message: "Cannot have more than 10 tags",
    },
  },
  isFeatured: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
  },
});

productSchema.pre("save", function (next) {
  this.updateAt = Date.now();
  next();
});

const Product = model("Product", productSchema);

export default Product;
