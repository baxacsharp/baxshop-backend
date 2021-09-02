import express from "express"
import createError from "http-errors"
import brandSchema from "../../schemas/brandSchema.js"
import productSchema from "../../schemas/ProductsSchema.js"
import { role } from "../../Auth/permissions.js"
import { JWTAuthMiddleware } from "../../Auth/middlewares.js"
import ProductsSchema from "../../schemas/ProductsSchema.js"
import { disableProducts } from "../../helpers/tax.js"
const brandRouter = express.Router()

brandRouter.post(
  "/",
  JWTAuthMiddleware,
  role.checkRole(role.ROLES.Admin),
  async (req, res, next) => {
    try {
      const { name, description, isActive } = req.body
      if (!description || !name) {
        next(createError(400, "you must provide required fields"))
      } else {
        const brand = new brandSchema({
          name,
          description,
          isActive,
        })
        const createdBrand = await brand.save()
        res.status(201).send(createdBrand)
      }
    } catch (error) {
      console.log(error)
      next(createError(500, "Internal SERVER ERROR"))
    }
  }
)
brandRouter.get("/lists", async (req, res, next) => {
  try {
    const brands = await brandSchema
      .find({ isActive: true })
      .populate("merchant", "name")
    res.status(200).send(brands)
  } catch (error) {
    next(createError(500, "Internal server error"))
  }
})
brandRouter.get(
  "/",
  JWTAuthMiddleware,
  role.checkRole(role.ROLES.Admin),
  async (req, res, next) => {
    try {
      let brands
      if (req.user.merchant) {
        brands = await brandSchema
          .find({ merchant: req.user.merchant })
          .populate("merchant", "name")
      } else {
        brands = await brandSchema.find({}).populate("merchant", "name")
      }
      res.status(200).send(brands)
    } catch (error) {
      next(createError(500, "Internal server error"))
    }
  }
)
brandRouter.get("/:id", async (req, res, next) => {
  try {
    const brand = await brandSchema.findById(req.params.id)
    if (!brand) {
      next(createError(404, `id provided ${req.params.id} is not found`))
    } else {
      res.status(200).send(brand)
    }
  } catch (error) {
    next(createError(500, "Internal server error"))
  }
})
brandRouter.get(
  "/list/select",
  JWTAuthMiddleware,
  role.checkRole(role.ROLES.Admin),
  async (req, res, next) => {
    try {
      let brands
      if (req.user.merchant) {
        brands = await brandSchema.find({ merchant: req.user.merchant }, "name")
      } else {
        brands = await brandSchema.find({}, "name")
      }
      res.status(200).send(brands)
    } catch (error) {
      next(createError(500, "Internal server error"))
    }
  }
)
brandRouter.put(
  "/:id",
  JWTAuthMiddleware,
  role.checkRole(role.ROLES.Admin || role.ROLES.Merchant),
  async (req, res, next) => {
    try {
      const updatedBrand = await brandSchema.findOneAndUpdate(
        { _id: req.params.id },
        req.body.brand,
        { new: true }
      )
      if (updatedBrand) {
        res.status(204).send(updatedBrand)
      } else {
        next(createError(404, `Id provided ${req.paramd.id} isnot valid`))
      }
    } catch (error) {
      next(createError(500, "Internal server error"))
    }
  }
)
brandRouter.put(
  "/:id/active",
  JWTAuthMiddleware,
  role.checkRole(role.ROLES.Admin),
  async (req, res, next) => {
    try {
      const update = req.body.brand
      if (!update.isActive) {
        const products = await ProductsSchema.find({ brand: req.params.id })
        disableProducts(products)
      } else {
        const editedBrands = await brandSchema.findOneAndUpdate(
          { _id: req.params.id },
          update,
          { new: true }
        )
        res.status(204).send(editedBrands)
      }
    } catch (error) {
      next(createError(500, "Internal server error"))
    }
  }
)
brandRouter.delete(
  "/:id",
  JWTAuthMiddleware,
  role.checkRole(role.ROLES.Admin),
  async (req, res, next) => {
    try {
      const brand = await brandSchema.deleteOne({ _id: req.params.id })
      if (brand) {
        res.status(204).send("Sucessfully deleted")
      } else {
        next(createError(404, `Id provided ${req.paramd.id} isnot valid`))
      }
    } catch (error) {
      next(createError(500, "Internal server error"))
    }
  }
)
export default brandRouter
