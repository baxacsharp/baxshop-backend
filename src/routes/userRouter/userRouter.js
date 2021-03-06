import multer from "multer"
import express from "express"
import passport from "passport"
import mongoose from "mongoose"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import q2m from "query-to-mongo"
import createError from "http-errors"
import { v2 as cloudinary } from "cloudinary"
import { validationResult } from "express-validator"
import { CloudinaryStorage } from "multer-storage-cloudinary"
import Model from "../../schemas/UsersSchema.js"
import { cookieOptions } from "../../Auth/tools.js"
import { role } from "../../Auth/permissions.js"
import { JWTAuthMiddleware } from "../../Auth/middlewares.js"
import { refreshTokens, JWTAuthenticate } from "../../Auth/tools.js"
import {
  LoginValidator,
  ResetValidator,
  UserValidator,
  CheckPassword,
} from "./validator.js"
import crypto from "crypto"
import { signUpEmail, resetEmail } from "../../helpers/email.js"
const { isValidObjectId } = mongoose
const userRouter = express.Router()

userRouter.post("/register", UserValidator, async (req, res, next) => {
  try {
    const errors = validationResult(req)
    if (errors.isEmpty()) {
      const entry = new Model(req.body)
      const result = await entry.save()

      if (result) {
        const { email, password } = req.body
        const user = await Model.checkCredentials(email, password)

        if (user) {
          const { accessToken, refreshToken } = await JWTAuthenticate(user)

          res.cookie("accessToken", accessToken, cookieOptions)
          res.cookie("refreshToken", refreshToken, {
            ...cookieOptions,
            path: "/users/refreshToken",
          })
          await signUpEmail(user)
          res.send(user)
        } else next(createError(500, "Something went wrong while logging in"))
      } else next(createError(500, "Something went wrong while registering"))
    } else next(createError(400, errors.mapped()))
  } catch (error) {
    next(error)
  }
})

userRouter.post("/login", LoginValidator, async (req, res, next) => {
  try {
    const errors = validationResult(req)
    if (errors.isEmpty()) {
      const { email, password } = req.body
      const user = await Model.checkCredentials(email, password)

      if (user) {
        const { accessToken, refreshToken } = await JWTAuthenticate(user)

        res.cookie("accessToken", accessToken, cookieOptions)
        res.cookie("refreshToken", refreshToken, {
          ...cookieOptions,
          path: "/users/refreshToken",
        })
        res.send({ accessToken, user })
      } else next(createError(401, "Wrong credentials provided"))
    } else next(createError(400, errors.mapped()))
  } catch (error) {
    next(error)
  }
})
userRouter
userRouter.get(
  "/google/login",
  passport.authenticate("google", { scope: ["profile", "email"] })
)
userRouter.get(
  "/googleRedirect",
  passport.authenticate("google"),
  async (req, res, next) => {
    try {
      ;async (req, res) => {
        const payload = {
          id: req.user.id,
        }
        await JWTAuthenticate(payload)
      }
      res.redirect("http://localhost:3000/shop")
    } catch (error) {
      ////console.log(error)
      next(error)
    }
  }
)
userRouter.post("/recover", ResetValidator, async (req, res, next) => {
  try {
    const errors = validationResult(req)
    if (errors.isEmpty()) {
      const user = await Model.findOne({ email: req.body.email })
      if (!user) {
        next(createError(404, `Email, not found`))
      } else {
        const resetToken = crypto.randomBytes(20).toString("hex")
        user.resetPasswordToken = resetToken
        user.resetPasswordExpires = Date.now() + 3600000
        const savedUser = await user.save()
        await resetEmail(req.headers.host, resetToken, user)
        res.status(201).send({ message: ` A reset email has been sent` })
      }
    } else {
      next(createError(400, errors.mapped()))
    }
  } catch (error) {
    next(error)
    console.log(error)
  }
})
// userRouter.get("/reset/:token", async (req, res, next) => {
//   try {
//     const user = Model.findOne({
//       resetPasswordToken: req.params.token,
//       resetPasswordExpires: { $gt: Date.now() },
//     })
//     if (!user) {
//       next(createError(401, `User isnot found`))
//     }
//     res.render("reset", { user })
//   } catch (error) {
//     next(error)
//     console.log(error)
//   }
// })
userRouter.post("/reset/:token", CheckPassword, async (req, res, next) => {
  try {
    const errors = validationResult(req)
    if (errors.isEmpty()) {
      const user = await Model.findOne({
        resetPasswordToken: req.params.token,
        resetPasswordExpires: { $gt: Date.now() },
      })
      if (!user) {
        next(createError(401, `User isnot found`))
      } else {
        const { accessToken, refreshToken } = await JWTAuthenticate(user)
        user.password = req.body.password
        user.resetPasswordToken = undefined
        user.resetPasswordExpires = undefined
      }
      confirmResetPasswordEmail(user)
      res.status(201).send(`Your password has been updated`)
    } else {
      next(createError(400, errors.mapped()))
    }
  } catch (error) {
    next(error)
    console.log(error)
  }
})
userRouter.post("/logout", JWTAuthMiddleware, async (req, res, next) => {
  try {
    let user = req.user
    user.refreshToken = undefined
    await user.save()
    res.clearCookie("accessToken", cookieOptions)
    res.clearCookie("refreshToken", cookieOptions)
    res.status(205).send("Logged out")
  } catch (error) {
    next(error)
  }
})

userRouter.post("/refreshToken", async (req, res, next) => {
  try {
    if (!req.cookies.refreshToken)
      next(createError(400, "Refresh Token not provided"))
    else {
      const { newAccessToken, newRefreshToken } = await refreshTokens(
        req.cookies.refreshToken
      )
      res.cookie("accessToken", newAccessToken, cookieOptions)
      res.cookie("refreshToken", newRefreshToken, {
        ...cookieOptions,
        path: "/users/refreshToken",
      })
      res.send("OK")
    }
  } catch (error) {
    next(error)
  }
})
userRouter.get(
  "/search",
  JWTAuthMiddleware,
  role.checkRole(role.ROLES.Admin),
  async (req, res, next) => {
    try {
      const query = q2m(req.query)
      const users = await Model.countDocuments(query.criteria)
      const maxLimit = 10
      if (!query.options.limit) query.options.limit = maxLimit
      query.options.limit =
        query.options.limit > maxLimit ? maxLimit : query.options.limit
      const result = await Model.find(query.criteria)
        .sort(query.options.sort)
        .skip(query.options.skip || 0)
        .limit(query.options.limit)
      const response = result.map((entry) => ({
        _id: entry._id,
        firstName: entry.firstName,
        lastName: entry.lastName,
        avatar: entry.avatar,
        email: entry.email,
        createdAt: entry.createdAt,
        role: entry.role,
      }))
      const pages = Math.ceil(users / query.options.limit)
      res
        .status(200)
        .send({ navigation: query.links("/users", users), pages, response })
    } catch (error) {
      next(error)
    }
  }
)

userRouter.get("/me", JWTAuthMiddleware, async (req, res, next) => {
  try {
    res.send(req.user)
  } catch (error) {
    next(error)
  }
})

// userRouter.get(
//   "/me/chats",
//   NormalMinuteSpeedLimiter,
//   JWTAuthMiddleware,
//   async (req, res, next) => {
//     try {
//       const result = await ChatModel.findOne({ room: req.user.room })
//       res.send(result)
//     } catch (error) {
//       next(error)
//     }
//   }
// )

// userRouter.get(
//   "/me/chats/:id",
//   NormalMinuteSpeedLimiter,
//   JWTAuthMiddleware,
//   async (req, res, next) => {
//     try {
//       const result = await ChatModel.findById(req.params.id).populate("chats")
//       res.send(result)
//     } catch (error) {
//       next(error)
//     }
//   }
// )

userRouter.delete("/me", JWTAuthMiddleware, async (req, res, next) => {
  try {
    const user = req.user
    await user.deleteOne()
    res.status(404).send("User not found")
  } catch (error) {
    next(error)
  }
})

userRouter.put("/me", JWTAuthMiddleware, async (req, res, next) => {
  const { firstName, lastName, email } = req.body
  try {
    const errors = validationResult(req)
    if (errors.isEmpty()) {
      const user = req.user
      if (firstName) user.firstName = firstName
      if (lastName) user.lastName = lastName
      if (email) user.email = email
      //if (password) user.password = await hashPassword(req.body.password)

      const result = await user.save()

      res.status(200).send(result)
    } else next(createError(400, errors.mapped()))
  } catch (error) {
    next(error)
  }
})

const cloudinaryStorage = new CloudinaryStorage({
  cloudinary,
  params: { folder: "Ecommerce" },
})
const upload = multer({ storage: cloudinaryStorage }).single("avatar")
userRouter.post(
  "/me/avatar",
  JWTAuthMiddleware,
  upload,
  async (req, res, next) => {
    try {
      let user = req.user
      user.avatar = req.file.path
      await user.save()
      res.status(200).send(user)
    } catch (error) {
      ////console.log(error)
      next(error)
    }
  }
)

userRouter.get("/:id", JWTAuthMiddleware, async (req, res, next) => {
  try {
    if (!isValidObjectId(req.params.id))
      next(createError(400, `ID ${req.params.id} is invalid`))
    else {
      const result = await Model.findById(req.params.id)
      if (!result) next(createError(404, `ID ${req.params.id} was not found`))
      else res.status(200).send(result)
    }
  } catch (error) {
    next(error)
  }
})

userRouter.delete(
  "/:id",
  JWTAuthMiddleware,
  role.checkRole(role.ROLES.Admin),
  async (req, res, next) => {
    try {
      let result
      if (!isValidObjectId(req.params.id))
        next(createError(400, `ID ${req.params.id} is invalid`))
      else
        result = await Model.findByIdAndDelete(req.params.id, {
          useFindAndModify: false,
        })

      if (result) res.status(204).send()
      else next(createError(404, `ID ${req.params.id} was not found`))
    } catch (error) {
      next(error)
    }
  }
)

const mongoPutOptions = {
  runValidators: true,
  new: true,
  useFindAndModify: false,
}
userRouter.put(
  "/:id",
  JWTAuthMiddleware,
  role.checkRole(role.ROLES.Admin),
  async (req, res, next) => {
    try {
      let result
      if (!isValidObjectId(req.params.id))
        next(createError(400, `ID ${req.params.id} is invalid`))
      else
        result = await Model.findByIdAndUpdate(
          req.params.id,
          req.body,
          mongoPutOptions
        )

      if (!result) next(createError(404, `ID ${req.params.id} was not found`))
      else res.status(200).send(result)
    } catch (error) {
      next(error)
    }
  }
)

export default userRouter
