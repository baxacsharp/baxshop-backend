import express from "express"
import createError from "http-errors"
import { contactEmail } from "../../helpers/email.js"
import contactSchema from "../../schemas/contactSchema.js"

const contactRouter = express.Router()
contactRouter.post("/", async (req, res, next) => {
  try {
    const { name, email, message } = req.body
    const contact = new contactSchema({ email, message, name })
    const newContact = await contact.save()
    await contactEmail(email)
    res.status(201).send(newContact)
  } catch (error) {
    next(createError(500, "Internal server error"))
  }
})
export default contactRouter
