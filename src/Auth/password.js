import UsersSchema from "../schemas/UsersSchema"
import createError from "http-errors"
import { confirmResetPasswordEmail, resetEmail } from "../helpers/email"
export const recover = async (req, res, next) => {
  try {
    const user = UsersSchema.findOne({ email: req.body.email })
    if (!user) {
      next(createError(404, `Email, not found`))
    } else {
      user.generatePasswordReset()
      const savedUser = await user.save()
      await resetEmail(req.headers.host, user, user.resetPasswordToken)
    }
    res.status(200).send({ message: ` A reset email has beedn sent` })
  } catch (error) {
    next(error)
    console.log(error)
  }
}
export const reset = (req, res, next) => {
  try {
    const user = UsersSchema.findOne({
      resetPasswordToken: req.params.token,
      resetPasswordExpires: { $gt: Date.now() },
    })
    if (!user) {
      next(createError(401, `User isnot found`))
    }
    res.render("reset", { user })
  } catch (error) {
    next(error)
    console.log(error)
  }
}
export const resetPassword = (req, res, next) => {
  try {
    const user = UsersSchema.findOne({
      resetPasswordToken: req.params.token,
      resetPasswordExpires: { $gt: Date.now() },
    })
    if (!user) {
      next(createError(401, `User isnot found`))
    } else {
      user.password = req.body.password
      user.resetPasswordToken = undefined
      user.resetPasswordExpires = undefined
    }
    confirmResetPasswordEmail(user)
    res.status(201).send(`Your password has been updated`)
  } catch (error) {
    next(error)
    console.log(error)
  }
}
