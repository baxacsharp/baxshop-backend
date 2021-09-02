import express from "express"
import createError from "http-errors"
import { JWTAuthMiddleware } from "../../Auth/middlewares.js"
import { role } from "../../Auth/permissions.js"
import { disableProducts } from "../../helpers/tax.js"
import categorySchema from "../../schemas/categorySchema.js"
const categoryRouter = express.Router()

categoryRouter.post(
  "/",
  JWTAuthMiddleware,
  role.checkRole(role.ROLES.Admin),
  async (req, res, next) => {
    try {
      const { name, isActive, products } = req.body
      const category = new categorySchema({
        name,
        isActive,
        products,
      })
      await category.save()
      res.status(201).send(category)
    } catch (error) {
      next(createError(500, "Internal server error"))
    }
  }
)
categoryRouter.get("/", async (req, res, next) => {
  try {
    const categories = await categorySchema.find({})
    res.status(200).send(categories)
  } catch (error) {
    next(createError(500, "Internal server error"))
  }
})
categoryRouter.get("/list", (req, res) => {
  categorySchema.find({ isActive: true }, (err, data) => {
    if (err) {
      return res.status(400).json({
        error: "Your request could not be processed. Please try again.",
      })
    }
    res.status(200).json({
      categories: data,
    })
  })
})

categoryRouter.get("/:id", async (req, res, next) => {
  try {
    const id = req.params.id
    if (!id) {
      next(createError(400, "yo must provide id"))
    } else {
      const category = await categorySchema
        .findOne({
          _id: id,
        })
        .populate({
          path: "products",
          select: "name",
        })
      if (!category) {
        next(createError(400, "yo must provide id"))
      } else {
        res.status(200).send(category)
      }
    }
  } catch (error) {
    next(createError(500, "Internal server error"))
  }
})
categoryRouter.put(
  "/:id",
  JWTAuthMiddleware,
  role.checkRole(role.ROLES.Admin),
  async (req, res, next) => {
    try {
      const editedCategory = await categorySchema.findOneAndUpdate(
        { _id: req.params.id },
        req.body.category,
        { new: true }
      )
      res.status(204).send(editedCategory)
    } catch (error) {
      next(createError(500, "Internal server error"))
    }
  }
)
categoryRouter.put(
  "/:id/active",
  JWTAuthMiddleware,
  role.checkRole(role.ROLES.Admin),
  async (req, res, next) => {
    try {
      const update = req.body.category
      if (update.isActive) {
        const editCategory = await categorySchema.findOneAndUpdate(
          { _id: req.params.id },
          update,
          { new: true }
        )
        res.status(204).send(editCategory)
      } else {
        const disabledCategory = await categorySchema
          .findOne({ _id: req.params.id, isActive: true }, "products - _id")
          .populate("products")
        disableProducts(disabledCategory.products)
      }
    } catch (error) {
      next(createError(500, "Internal server error"))
    }
  }
)
categoryRouter.delete(
  "/:id",
  JWTAuthMiddleware,
  role.checkRole(role.ROLES.Admin),
  async (req, res, next) => {
    try {
      const deletedCategory = await categorySchema.deleteOne({
        _id: req.params.id,
      })
      res.status(204).send(deletedCategory)
    } catch (error) {
      next(createError(500, "Internal server error"))
    }
  }
)
export default categoryRouter
