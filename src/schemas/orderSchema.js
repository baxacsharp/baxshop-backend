import mongoose from "mongoose"
const { Schema, model } = mongoose

const OrderSchema = new Schema(
  {
    cart: {
      type: Schema.Types.ObjectId,
      ref: "Cart",
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    total: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
)
export default model("Order", OrderSchema)
