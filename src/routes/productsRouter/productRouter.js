import express, { response } from "express"

const router = express.Router()

import multer from "multer"
import AWS from "aws-sdk"
import Mongoose from "mongoose"
import jwt from "jsonwebtoken"
// Bring in Models & Helpers
import Product from "../../schemas/ProductsSchema.js"
import Brand from "../../schemas/brandSchema.js"
import Category from "../../schemas/categorySchema.js"
import { CloudinaryStorage } from "multer-storage-cloudinary"
import { v2 as cloudinary } from "cloudinary"
import Wishlist from "../../schemas/wishListSchema.js"
import { JWTAuthMiddleware } from "../../Auth/middlewares.js"
import { role } from "../../Auth/permissions.js"
import { JWTAuthenticate, verifyToken } from "../../Auth/tools.js"
const cloudinaryStorage = new CloudinaryStorage({
  cloudinary,
  params: { folder: "Ecommerce-product" },
})
const upload = multer({ storage: cloudinaryStorage }).array("image")
// fetch product slug api
router.get("/item/:slug", async (req, res) => {
  try {
    const slug = req.params.slug

    const productDoc = await Product.findOne({ slug, isActive: true }).populate(
      {
        path: "brand",
        select: "name isActive slug",
      }
    )

    if (!productDoc || (productDoc && productDoc?.brand?.isActive === false)) {
      return res.status(404).json({
        message: "No product found.",
      })
    }

    res.status(200).json({
      product: productDoc,
    })
  } catch (error) {
    res.status(400).json({
      error: "Your request could not be processed. Please try again.",
    })
  }
})

// fetch  product name search api
router.get("/list/search/:name", async (req, res) => {
  try {
    const name = req.params.name

    const productDoc = await Product.find(
      { name: { $regex: new RegExp(name), $options: "is" }, isActive: true },
      { name: 1, slug: 1, imageUrl: 1, price: 1, _id: 0 }
    )

    if (productDoc.length < 0) {
      return res.status(404).json({
        message: "No product found.",
      })
    }

    res.status(200).json({
      products: productDoc,
    })
  } catch (error) {
    console.log(error)
    res.status(400).json({
      error: "Your request could not be processed. Please try again.",
    })
  }
})

// fetch store products by advancedFilters api
router.post("/advancedFilters", async (req, res) => {
  const pageSize = 8
  const page = Number(req.body.pageNumber) || 1
  const name = req.body.name || ""
  const category = req.body.category || ""
  const Merchant = req.body.Merchant || ""
  const order = req.body.order || ""
  const min =
    req.body.min && Number(req.body.min) !== 0 ? Number(req.body.min) : 0
  const max =
    req.body.max && Number(req.body.max) !== 0 ? Number(req.body.max) : 0
  const rating =
    req.body.rating && Number(req.body.rating) !== 0
      ? Number(req.body.rating)
      : 0

  const nameFilter = name ? { name: { $regex: name, $options: "i" } } : {}
  const sellerFilter = Merchant ? { Merchant } : {}
  const categoryFilter = category ? { category } : {}
  const priceFilter = min && max ? { price: { $gte: min, $lte: max } } : {}
  const ratingFilter = rating
    ? { rating: { $gte: rating } }
    : { rating: { $gte: rating } }
  const sortOrder =
    order === "Price Low to High"
      ? { price: 1 }
      : order === "Price High to Low"
      ? { price: -1 }
      : { _id: -1 }

  const basicQuery = [
    {
      $lookup: {
        from: "brands",
        localField: "brand",
        foreignField: "_id",
        as: "brands",
      },
    },
    {
      $unwind: "$brands",
    },
    {
      $addFields: {
        "brand.name": "$brands.name",
        "brand._id": "$brands._id",
        "brand.isActive": "$brands.isActive",
      },
    },
    {
      $lookup: {
        from: "reviews",
        localField: "_id",
        foreignField: "product",
        as: "reviews",
      },
    },
    {
      $addFields: {
        totalRatings: { $sum: "$reviews.rating" },
        totalReviews: { $size: "$reviews" },
      },
    },
    {
      $addFields: {
        averageRating: {
          $cond: [
            { $eq: ["$totalReviews", 0] },
            0,
            { $divide: ["$totalRatings", "$totalReviews"] },
          ],
        },
      },
    },
    {
      $match: {
        isActive: true,
        price: priceFilter.price,
        averageRating: ratingFilter.rating,
      },
    },
    { $project: { brands: 0, reviews: 0 } },
  ]

  try {
    const productsCount = await Product.aggregate(basicQuery)
    const paginateQuery = [
      { $sort: sortOrder },
      { $skip: pageSize * (productsCount.length > 8 ? page - 1 : 0) },
      { $limit: pageSize },
    ]
    const products = await Product.aggregate(basicQuery.concat(paginateQuery))

    res.status(200).json({
      products: products.filter((item) => item?.brand?.isActive === true),
      page: page,
      pages:
        productsCount.length > 0
          ? Math.ceil(productsCount.length / pageSize)
          : 0,
      totalProducts: productsCount.length,
    })
  } catch (error) {
    console.log(error)
    res.status(400).json({
      error: "Your request could not be processed. Please try again.",
    })
  }
})

// fetch store products api
router.get("/list", async (req, res) => {
  try {
    // const userDoc = await JWTAuthenticate(req.user)

    const products = await Product.aggregate([
      {
        $match: { isActive: true },
      },
      {
        $lookup: {
          from: "brands",
          localField: "brand",
          foreignField: "_id",
          as: "brands",
        },
      },
      {
        $unwind: "$brands",
      },
      {
        $addFields: {
          "brand.name": "$brands.name",
          "brand._id": "$brands._id",
          "brand.isActive": "$brands.isActive",
        },
      },
      {
        $lookup: {
          from: "reviews",
          localField: "_id",
          foreignField: "product",
          as: "reviews",
        },
      },
      {
        $addFields: {
          totalRatings: { $sum: "$reviews.rating" },
          totalReviews: { $size: "$reviews" },
        },
      },
      {
        $addFields: {
          averageRating: {
            $cond: [
              { $eq: ["$totalReviews", 0] },
              0,
              { $divide: ["$totalRatings", "$totalReviews"] },
            ],
          },
        },
      },
      { $project: { brands: 0, reviews: 0 } },
    ])

    res.status(200).json({
      products: products
        .filter((item) => item?.brand?.isActive === true)
        .reverse()
        .slice(0, 8),
      page: 1,
      pages: products.length > 0 ? Math.ceil(products.length / 8) : 0,
      totalProducts: products.length,
    })
  } catch (error) {
    console.log(error)
    res.status(400).json({
      error: "Your request could not be processed. Please try again.",
    })
  }
})

// fetch store products by category api
router.get("/list/category/:slug", async (req, res) => {
  try {
    const slug = req.params.slug

    const categoryDoc = await Category.findOne(
      { slug, isActive: true },
      "products -_id"
    ).populate({
      path: "products",
      match: {
        isActive: true,
      },
      populate: {
        path: "brand",
        model: "Brand",
        select: "name isActive",
      },
    })

    if (!categoryDoc) {
      return res.status(404).json({
        message: `Cannot find category with the slug: ${slug}.`,
      })
    }

    let products = []

    products = categoryDoc.products

    res.status(200).json({
      products,
    })
  } catch (error) {
    console.log(error)
    res.status(400).json({
      error: "Your request could not be processed. Please try again.",
    })
  }
})

// fetch store products by brand api
router.get("/list/brand/:slug", async (req, res) => {
  try {
    const slug = req.params.slug

    const brand = await Brand.findOne({ slug, isActive: true })

    if (!brand) {
      return res.status(404).json({
        message: `Cannot find brand with the slug: ${slug}.`,
      })
    }

    const products = await Product.find({
      brand: brand._id,
      isActive: true,
    }).populate("brand", "name")

    res.status(200).json({
      products,
    })
  } catch (error) {
    console.log(error)
    res.status(400).json({
      error: "Your request could not be processed. Please try again.",
    })
  }
})

router.get("/list/select", JWTAuthMiddleware, async (req, res) => {
  try {
    const products = await Product.find({}, "name")

    res.status(200).json({
      products,
    })
  } catch (error) {
    console.log(error)
    res.status(400).json({
      error: "Your request could not be processed. Please try again.",
    })
  }
})

// add product api
router.post(
  "/add",
  JWTAuthMiddleware,
  role.checkRole(role.ROLES.Admin, role.ROLES.Merchant),
  upload,
  async (req, res) => {
    try {
      console.log(req.body)
      const sku = req.body.sku
      const name = req.body.name
      const description = req.body.description
      const quantity = req.body.quantity
      const price = req.body.price
      const taxable = req.body.taxable
      const isActive = req.body.isActive
      const brand = req.body.brand
      const imageUrl = req.files[0].path

      if (!sku) {
        return res.status(400).json({ error: "You must enter sku." })
      }

      if (!description || !name) {
        return res
          .status(400)
          .json({ error: "You must enter description & name." })
      }

      if (!quantity) {
        return res.status(400).json({ error: "You must enter a quantity." })
      }

      if (!price) {
        return res.status(400).json({ error: "You must enter a price." })
      }

      const foundProduct = await Product.findOne({ sku })

      if (foundProduct) {
        return res.status(400).json({ error: "This sku is already in use." })
      }

      const product = new Product({
        sku,
        name,
        description,
        quantity,
        price,
        taxable,
        isActive,
        brand,
        imageUrl,
      })

      const savedProduct = await product.save()

      res.status(200).json({
        success: true,
        message: `Product has been added successfully!`,
        product: savedProduct,
      })
    } catch (error) {
      console.log(error)
      return res.status(400).json({
        error: "Your request could not be processed. Please try again.",
      })
    }
  }
)

// fetch products api
router.get(
  "/",
  JWTAuthMiddleware,
  role.checkRole(role.ROLES.Admin, role.ROLES.Merchant),
  async (req, res) => {
    try {
      let products = []

      if (req.user.merchant) {
        const brands = await Brand.find({
          merchant: req.user.merchant,
        }).populate("merchant", "_id")

        const brandId = brands[0]["_id"]

        products = await Product.find({})
          .populate({
            path: "brand",
            populate: {
              path: "merchant",
              model: "Merchant",
            },
          })
          .where("brand", brandId)
      } else {
        products = await Product.find({}).populate({
          path: "brand",
          populate: {
            path: "merchant",
            model: "Merchant",
          },
        })
      }

      res.status(200).json({
        products,
      })
    } catch (error) {
      console.log(response)
      res.status(400).json({
        error: "Your request could not be processed. Please try again.",
      })
    }
  }
)

// fetch product api
router.get(
  "/:id",
  JWTAuthMiddleware,
  role.checkRole(role.ROLES.Admin, role.ROLES.Merchant),
  async (req, res) => {
    try {
      const productId = req.params.id

      let productDoc = null

      if (req.user.merchant) {
        const brands = await Brand.find({
          merchant: req.user.merchant,
        }).populate("merchant", "_id")

        const brandId = brands[0]["_id"]

        productDoc = await Product.findOne({ _id: productId })
          .populate({
            path: "brand",
            select: "name",
          })
          .where("brand", brandId)
      } else {
        productDoc = await Product.findOne({ _id: productId }).populate({
          path: "brand",
          select: "name",
        })
      }

      if (!productDoc) {
        return res.status(404).json({
          message: "No product found.",
        })
      }

      res.status(200).json({
        product: productDoc,
      })
    } catch (error) {
      console.log(error)
      res.status(400).json({
        error: "Your request could not be processed. Please try again.",
      })
    }
  }
)

router.put(
  "/:id",
  JWTAuthMiddleware,
  role.checkRole(role.ROLES.Admin, role.ROLES.Merchant),
  async (req, res) => {
    try {
      const productId = req.params.id
      const update = req.body.product
      const query = { _id: productId }

      await Product.findOneAndUpdate(query, update, {
        new: true,
      })

      res.status(200).json({
        success: true,
        message: "Product has been updated successfully!",
      })
    } catch (error) {
      res.status(400).json({
        error: "Your request could not be processed. Please try again.",
      })
    }
  }
)

router.put(
  "/:id/active",
  JWTAuthMiddleware,
  role.checkRole(role.ROLES.Admin, role.ROLES.Merchant),
  async (req, res) => {
    try {
      const productId = req.params.id
      const update = req.body.product
      const query = { _id: productId }

      await Product.findOneAndUpdate(query, update, {
        new: true,
      })

      res.status(200).json({
        success: true,
        message: "Product has been updated successfully!",
      })
    } catch (error) {
      res.status(400).json({
        error: "Your request could not be processed. Please try again.",
      })
    }
  }
)

router.delete(
  "/delete/:id",
  JWTAuthMiddleware,
  role.checkRole(role.ROLES.Admin, role.ROLES.Merchant),
  async (req, res) => {
    try {
      const product = await Product.deleteOne({ _id: req.params.id })

      res.status(200).json({
        success: true,
        message: `Product has been deleted successfully!`,
        product,
      })
    } catch (error) {
      res.status(400).json({
        error: "Your request could not be processed. Please try again.",
      })
    }
  }
)

export default router
