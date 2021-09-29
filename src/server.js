import cors from "cors"
import express from "express"
import passport from "passport"
import oauth from "./Auth/oauth.js"
import mongoose from "mongoose"
import cookieParser from "cookie-parser"
import createError from "http-errors"
import { catchAllHandler, error4xx } from "./errorHandler.js"
import listEndpoints from "express-list-endpoints"
import productsRouter from "./routes/productsRouter/productRouter.js"
import userRouter from "./routes/userRouter/userRouter.js"
import addressRouter from "./routes/addressRouter/adressRouter.js"
import brandsRouter from "./routes/brandsRouter/brandRouter.js"
import cartRouter from "./routes/cartRouter/cartRouter.js"
import contactRouter from "./routes/contactRouter/contactRouter.js"
import merchantRouter from "./routes/merchantRouter/merchantRouter.js"
import orderRouter from "./routes/orderRouter/orderRouter.js"
import reviewRouter from "./routes/reviewRouter/reviewRouter.js"
import wishListRouter from "./routes/wishListRouter/wishListRouter.js"
import categoryRouter from "./routes/categoryRouter/categoryRouter.js"

const server = express()
const port = process.env.PORT || 3001
if (process.env.TS_NODE_DEV || process.env.NODE_ENV === "test")
  require("dotenv").config()

// const { FRONTEND_DEV_URL, FRONTEND_PROD_URL } = process.env
// if (!FRONTEND_DEV_URL || !FRONTEND_PROD_URL)
//   throw new Error("Environment variables unreachable.")

// const whitelist = [
//   FRONTEND_DEV_URL,
//   FRONTEND_PROD_URL,
//   `${FRONTEND_PROD_URL}/`,
//   `${FRONTEND_DEV_URL}/`,
// ]
// export const corsOptions = {
//   origin: (origin, next) => {
//     try {
//       if (whitelist.indexOf(origin) !== -1) next(null, true)
//       else
//         next(
//           createError(400, "Cross-Site Origin Policy blocked your request"),
//           true
//         )
//     } catch (error) {
//       next(error)
//     }
//   },
//   credentials: true,
// }

// import fs from "fs"
// import { fileURLToPath } from "url"
// import { dirname, join } from "path"
// const noAvatar = join(
//   dirname(fileURLToPath(import.meta.url)),
//   "./resources/images/noavatar.png"
// )
// server.get("/images/noavatar.png", (req, res, next) => {
//   res.sendFile(noAvatar)
// })

server.use(cors({ origin: "http://localhost:3000", credentials: true }))
server.use(express.json())
server.use(cookieParser())
server.use(passport.initialize())
//server.use(csrf({ cookie: cookieOptions }))
server.use("/user", userRouter)
server.use("/products", productsRouter)
server.use("/address", addressRouter)
server.use("/brands", brandsRouter)
server.use("/cart", cartRouter)
server.use("/contact", contactRouter)
server.use("/merchant", merchantRouter)
server.use("/order", orderRouter)
server.use("/review", reviewRouter)
server.use("/wishList", wishListRouter)
server.use("/category", categoryRouter)

server.use(error4xx)
server.use(catchAllHandler)

console.table(listEndpoints(server))
const { MONGO_CONNECTION } = process.env
if (!MONGO_CONNECTION) throw new Error("No Mongo DB specified")

mongoose
  .connect(MONGO_CONNECTION, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
  })
  .then(() =>
    server.listen(port, () => console.log("Server running on port", port))
  )
  .catch((e) => console.log(e))
