import mongoose from "mongoose"
const { Schema, model } = mongoose

const WishListSchema = new Schema(
  {
    product: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      default: null,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  { timestamps: true }
)
export default model("WishList", WishListSchema)
