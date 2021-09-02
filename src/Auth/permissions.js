import createError from "http-errors"

const ROLES = {
  Admin: "ROLE_ADMIN",
  Merchant: "ROLE_MERCHANT",
  Customer: "ROLE_MEMBER",
  Host: "Host",
}
const checkRole =
  (...roles) =>
  (req, res, next) => {
    if (!req.user) {
      res.status(401).send("Unauthorized")
    } else {
      const hasRole = roles.find((role) => req.user.role === role)
      if (!hasRole) {
        return res.status(403).send("You are not allowed to make this request")
      }
      return next()
    }
  }
export const role = { ROLES, checkRole }
