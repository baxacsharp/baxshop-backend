import mongoose from "mongoose"
import bcrypt from "bcrypt"
import crypto from "crypto"
import { hashPassword } from "../Auth/tools.js"
const { Schema, model } = mongoose
const UserSchema = new Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true},
    merchant: {
      type: Schema.Types.ObjectId,
      ref: "Merchant",
      default: null,
    },
    password: { type: String },
    refreshToken: { type: String },
    googleOAuth: { type: String },
    role: {
      type: String,
      default: "ROLE_MEMBER",
      enum: ["ROLE_MEMBER", "ROLE_ADMIN", "ROLE_MERCHANT"],
    },
    facebookId: {
      type: String,
    },
    resetPasswordToken: {
      type: String,
      required: false,
    },
    resetPasswordExpires: {
      type: Date,
      required: false,
    },
    avatar: {
      type: String,
      required: true,
      default: "https://bw4-be.herokuapp.com/images/noavatar.png",
    },
  },
  { timestamps: true }
)

UserSchema.methods.toJSON = function () {
  const schema = this
  const object = schema.toObject()

  delete object.password
  delete object.refreshToken
  delete object.__v

  return object
}

UserSchema.statics.checkCredentials = async function (email, plainPw) {
  const user = await this.findOne({ email })
  if (user) {
    const hashedPw = user.password
    if (!hashedPw) return null
    const isMatch = await bcrypt.compare(plainPw, hashedPw)

    if (isMatch) return user
  }

  return null
}
// UserSchema.methods.generatePasswordReset = function () {
//   this.resetPasswordToken = crypto.randomBytes(20).toString("hex")
//   this.resetPasswordExpires = Date.now() + 3600000
// }
UserSchema.pre("save", async function (next) {
  const newUser = this
  const plaintextPassword = newUser.password
  if (plaintextPassword && this.isModified("password"))
    newUser.password = await hashPassword(plaintextPassword)

  next()
})

export default model("User", UserSchema)
