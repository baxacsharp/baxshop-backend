import mongoose from "mongoose"
const { Schema, model } = mongoose

export const CartItemSchema = new Schema({
  product: {
    type: Schema.Types.ObjectId,
    ref: "Product",
  },
  quantity: {
    type: Number,
    default: 1,
  },
  priceWithTax: {
    type: Number,
    default: 0,
  },
  totalTax: {
    type: Number,
    default: 0,
  },
  buyPrice: {
    type: Number,
    default: 0,
  },
  totalPrice: {
    type: Number,
    default: 0,
  },
  status: {
    type: String,
    default: "Not processed",
    enum: [
      "Not processed",
      "in process",
      "Shipping",
      "Shipped",
      "Delivered",
      "Cancelled",
    ],
  },
})

const CartSchema = new Schema(
  {
    products: [CartItemSchema],
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
)
export default model("Cart", CartSchema)
