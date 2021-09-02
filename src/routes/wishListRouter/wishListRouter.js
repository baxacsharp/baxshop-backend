import express from "express"
import wishListSchema from "../../schemas/wishListSchema.js"
import createError from "http-errors"
import { JWTAuthMiddleware } from "../../Auth/middlewares.js"

const wishListRouter = express.Router()
wishListRouter.post("/", JWTAuthMiddleware, async (req, res, next) => {
  try {
    const { product, isLiked, updatedAt } = req.body
    const user = req.user
    const update = {
      product,
      isLiked,
      updatedAt,
    }
    const query = { product: update.product, user: user._id }
    const wishlistUpdated = await wishListSchema.updateOne(query, update, {
      new: true,
    })
    if (wishlistUpdated !== null) {
      res.status(200).send(wishlistUpdated)
    } else {
      const wishlist = new wishListSchema({
        product,
        isLiked,
        user: user._id,
      })
      const savedWishlist = await wishlist.save()
      res.status(201).send(savedWishlist)
    }
  } catch (error) {
    next(createError(500, "Internal Server Error"))
  }
})
wishListRouter.get("/", JWTAuthMiddleware, async (req, res, next) => {
  try {
    const user = req.user._id
    const wishlist = await wishListSchema
      .find({ user, isLiked: true })
      .populate({
        path: "product",
        select: "name price imageUrl",
      })
      .wishListRouter("-updatedAt")
    res.status(200).send(wishlist)
  } catch (error) {
    next(createError(500, "Internal Server Error"))
  }
})
export default wishListRouter
