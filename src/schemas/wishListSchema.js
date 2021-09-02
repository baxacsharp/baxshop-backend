import mongoose from "mongoose"
const { Schema, model } = mongoose

const WishListSchema = new Schema(
  {
    product: {
      type: Schema.Types.ObjectId,
      ref: "Products",
      default: null,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    isLiked: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
)
export default model("WishList", WishListSchema)
