import express from "express"
import wishListSchema from "../../schemas/wishListSchema.js"
import createError from "http-errors"
import { JWTAuthMiddleware } from "../../Auth/middlewares.js"

const wishListRouter = express.Router()
wishListRouter.post("/", JWTAuthMiddleware, async (req, res, next) => {
  try {
    ////console.log(req.body)
    const { product } = req.body
    const user = req.user

    const wishlist = new wishListSchema({
      product,
      user: user._id,
    })
    const savedWishlist = await wishlist.save()
    res.status(201).send(savedWishlist)
  } catch (error) {
    ////console.log(error)
    next(createError(500, "Internal Server Error"))
  }
})
wishListRouter.get("/", JWTAuthMiddleware, async (req, res, next) => {
  try {
    const user = req.user._id
    const wishlist = await wishListSchema.find({ user }).populate({
      path: "product",
      select: "name price imageUrl slug",
    })
    res.status(200).send(wishlist)
  } catch (error) {
    ////console.log(error)
    next(createError(500, "Internal Server Error"))
  }
})
wishListRouter.delete("/:id", JWTAuthMiddleware, async (req, res, next) => {
  try {
    const deletedWishlist = await wishListSchema.deleteOne({
      _id: req.params.id,
    })
    res.status(204).send(deletedWishlist)
  } catch (error) {
    ////console.log(error)
    next(error)
  }
})
export default wishListRouter
