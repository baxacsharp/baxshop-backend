import mongoose from "mongoose"
const { Schema, model } = mongoose

const MerchantSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    phoneNumber: {
      type: String,
    },
    isActive: {
      type: Boolean,
      default: false,
    },
    brand: {
      type: String,
      required: true,
    },
    business: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      default: "Waiting approval",
      enum: ["Waiting approval", "Rejected", "Approved"],
    },
  },
  { timestamps: true }
)
export default model("Merchant", MerchantSchema)
