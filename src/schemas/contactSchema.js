import mongoose from "mongoose"
const { Schema, model } = mongoose

const ContactSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
)
export default model("Contact", ContactSchema)
