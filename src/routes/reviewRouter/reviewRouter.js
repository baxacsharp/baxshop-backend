import express from "express"
import createError from "http-errors"
import reviewSchema from "../../schemas/reviewSchema.js"
import productSchema from "../../schemas/ProductsSchema.js"
import { JWTAuthMiddleware } from "../../Auth/middlewares.js"

const reviewRouter = express.Router()

reviewRouter.post("/", JWTAuthMiddleware, async (req, res, next) => {
  try {
    const user = req.user
    const review = new reviewSchema(Object.assign(req.body, { user: user._id }))
    await review.save()
    res.status(201).send(review)
  } catch (error) {
    next(createError(500, "Internal server error"))
  }
})
reviewRouter.get("/", async (req, res, next) => {
  try {
    const reviews = await reviewSchema
      .find({})
      .populate({
        path: "user",
        select: "firstName",
      })
      .populate({
        path: "product",
        select: "name, imageUrl",
      })
      .sort("-createdAt")
    res.status(200).send(reviews)
  } catch (error) {
    next(createError(500, "Internal server error"))
  }
})
reviewRouter.get("/:id", async (req, res, next) => {
  try {
    const product = await productSchema.findOne({ _id: req.params.id })
    if (!product) {
      return res.status(404, "No reviews for this product")
    }
    const reviews = await reviewSchema
      .find({
        product: product._id,
      })
      .populate({
        path: "user",
        select: "firstName",
      })
      .sort("-createdAt")
    res.status(200).send(reviews)
  } catch (error) {
    next(createError(500, "Internal server error"))
  }
})
reviewRouter.put("/:id", JWTAuthMiddleware, async (req, res, next) => {
  try {
    const reviewId = req.params.id
    if (reviewId) {
      const editReview = await reviewSchema.findOneAndUpdate(
        { _id: reviewId },
        req.body,
        { new: true }
      )
      res.status(204).send(editReview)
    } else {
      next(createError(404, `Id provided ${req.params.id} is not found`))
    }
  } catch (error) {
    next(createError(500, "Internal server error"))
  }
})
reviewRouter.delete("/:id", JWTAuthMiddleware, async (req, res, next) => {
  try {
    const review = await reviewSchema.deleteOne({ _id: req.params.id })
    res.status(204).send("successfully deleted")
  } catch (error) {
    next(createError(500, "Internal server error"))
  }
})
// reviewRouter.post("/", JWTAuthenticate, async (req, res, next) => {
//   try {
//   } catch (error) {
//     next(createError(500, "Internal server error"))
//   }
// })
export default reviewRouter
