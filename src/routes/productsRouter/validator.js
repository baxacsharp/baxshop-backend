import { body } from "express-validator"

export const ProductsValidator = [
  body("name").exists().isString().withMessage("Name is mandatory field"),
  body("category")
    .exists()
    .isString()
    .withMessage("Category is mandatory field"),
  body("description")
    .exists()
    .isString()
    .isLength({ min: 20 })
    .withMessage("Description mandatory field and requires at least 20 words"),
  body("price")
    .exists()
    .isInt()
    .withMessage("Price is required field and must be integer"),
]
