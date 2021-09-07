import express from "express"
import createError from "http-errors"
import { JWTAuthMiddleware } from "../../Auth/middlewares.js"
import adressSchema from "../../schemas/adressSchema.js"

const addressRouter = express.Router()

addressRouter.get("/", JWTAuthMiddleware, async (req, res, next) => {
  try {
    const address = await adressSchema.find({ user: req.user._id })

    res.status(200).send(address)
  } catch (error) {
    next(createError(500, "internal server error"))
  }
})
addressRouter.get("/:id", async (req, res, next) => {
  try {
    const address = await adressSchema.findOne({ _id: req.params.id })
    if (address) {
      res.status(200).send(address)
    } else {
      res.status(404, `id ${req.params.id} is not found`)
    }
  } catch (error) {
    console.log(error)
    next(createError(500, "Internal Server Error"))
  }
})
addressRouter.post("/", JWTAuthMiddleware, async (req, res, next) => {
  try {
    const user = req.user
    const address = new adressSchema(
      Object.assign(req.body, { user: user._id })
    )
    const savedAddress = await address.save()
    if (savedAddress) {
      res.status(201).send(savedAddress)
    } else {
      next(createError(404, "User not found"))
    }
  } catch (error) {
    next(createError(500, "Internal Server Error"))
  }
})

addressRouter.delete("/:id", JWTAuthMiddleware, async (req, res, next) => {
  try {
    const deletedAdress = await adressSchema.findByIdAndDelete({
      _id: req.params.id,
    })
    if (!deletedAdress) {
      next(createError(404, "Cannot be deleted"))
      return
    } else {
      res.status(204).send(deletedAdress)
    }
  } catch (error) {
    next(createError(500, "Internal Server Error"))
  }
})
addressRouter.put("/:id", JWTAuthMiddleware, async (req, res, next) => {
  try {
    const editedAddress = await adressSchema.findOneAndUpdate(
      { _id: req.params.id },
      req.body,
      { new: true }
    )
    if (editedAddress) {
      res.status(204).send(editedAddress)
    } else {
      next(createError(404, `id provided ${req.params.id} is not found`))
    }
  } catch (error) {
    next(createError(500, "Internal Server Error"))
  }
})

export default addressRouter
