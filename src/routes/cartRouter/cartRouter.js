import express from "express"
import createError from "http-errors"
import CartSchema from "../../schemas/cartSchema.js"
import productsSchema from "../../schemas/ProductsSchema.js"
import { JWTAuthMiddleware } from "../../Auth/middlewares.js"
import { calculateItemTax } from "../../helpers/tax.js"

const cartRouter = express.Router()

cartRouter.post("/", JWTAuthMiddleware, async (req, res, next) => {
  try {
    const items = req.body.products
    console.log(items)
    const products = calculateItemTax(items)
    console.log(products)
    const user = req.user._id
    const cart = new CartSchema({ user, products })
    const cartSaved = await cart.save()
    decreaseQuantity(products)
    res.status(201).send(cartSaved)
  } catch (error) {
    console.log(error)
    next(createError(500, "internal Server Error"))
  }
})
cartRouter.post("/add/:cartId", JWTAuthMiddleware, async (req, res, next) => {
  try {
    const updateCart = await CartSchema.updateOne(
      { _id: req.params.cartId },
      { $push: { products: req.body.product } }
    )
    if (updateCart) {
      res.status(204).send(updateCart)
    } else {
      next(createError(404, `Id  provided ${req.paramd.cartId} is wrong`))
    }
  } catch (error) {
    next(createError(500, "internal Server Error"))
  }
})
cartRouter.delete("/:id", JWTAuthMiddleware, async (req, res, next) => {
  try {
    const deleteCart = await CartSchema.deleteOne({ _id: req.params.id })
    if (deleteCart) {
      res.status(204).send(deleteCart)
    } else {
      next(createError(404, `Id  provided ${req.paramd.cartId} is wrong`))
    }
  } catch (error) {
    next(createError(500, "internal Server Error"))
  }
})
cartRouter.delete(
  "/:cartId/:productId",
  JWTAuthMiddleware,
  async (req, res, next) => {
    try {
      const product = { product: req.params.productId }
      const cartId = { _id: req.params.cartId }
      if (!product) {
        next(
          createError(404, `Product Id ${req.params.productId} isnot correct`)
        )
      } else if (!cartId) {
        next(createError(404, `cartId ${req.params.cartId} is not correct`))
      } else {
        await CartSchema.updateOne(cartId, {
          $pull: { products: product },
        }).exec()
        res.status(204).send("successfully deleted")
      }
    } catch (error) {
      next(createError(500, "internal Server Error"))
    }
  }
)
const decreaseQuantity = (products) => {
  let bulkOptions = products.map((item) => {
    return {
      updateOne: {
        filter: { _id: item.product },
        update: { $inc: { quantity: -item.quantity } },
      },
    }
  })
  productsSchema.bulkWrite(bulkOptions)
}
export default cartRouter
