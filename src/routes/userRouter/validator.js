import { body } from "express-validator"
import { check } from "express-validator"
export const CheckPassword = [
  check("password")
    .not()
    .isEmpty()
    .isLength({ min: 6 })
    .withMessage("password must be at least 6 characters"),
  check("confirmPassword", "Passwords donot match").custom(
    (value, { req }) => value === req.body.password
  ),
]
export const ResetValidator = [
  body("email").exists().isEmail().withMessage("Enter email address"),
]
export const UserValidator = [
  body("firstName")
    .exists()
    .isString()
    .withMessage("Firstname is a mandatory field"),
  body("lastName")
    .exists()
    .isString()
    .withMessage("Surname is a mandatory field"),
  body("email")
    .exists()
    .isEmail()
    .normalizeEmail({
      gmail_remove_dots: false,
      gmail_remove_subaddress: false,
    })
    .withMessage("Invalid email"),
  body("password")
    .exists()
    .withMessage("Password is a mandatory field and needs to be strong"),
]

export const UserEditValidator = [
  body("firstName")
    .isString()
    .withMessage("Firstname needs to be of type string"),
  body("lastName").isString().withMessage("Surname needs to be of type string"),
  body("email")
    .isLength({ max: 64 })
    .withMessage("Email is a mandatory field")
    .isEmail()
    .normalizeEmail({
      gmail_remove_dots: false,
      gmail_remove_subaddress: false,
    })
    .withMessage("Invalid email"),
  body("password")
    .exists()
    .isStrongPassword()
    .withMessage("Password is a mandatory field and needs to be strong"),
]

export const LoginValidator = [
  body("email")
    .exists()
    .withMessage("Email is a mandatory field")
    .isEmail()
    .normalizeEmail({
      gmail_remove_dots: false,
      gmail_remove_subaddress: false,
    })
    .withMessage("Invalid email"),
  body("password").exists().withMessage("Password is a mandatory field"),
]
