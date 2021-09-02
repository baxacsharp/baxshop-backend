import mongoose from "mongoose"
import slug from "mongoose-slug-generator"
const { Schema, model } = mongoose

const options = {
  separator: "-",
  lang: "en",
  truncate: 120,
}

mongoose.plugin(slug, options)

// Brand Schema
const BrandSchema = new Schema({
  name: {
    type: String,
    trim: true,
  },
  slug: {
    type: String,
    slug: "name",
    unique: true,
  },
  image: {
    data: Buffer,
    contentType: String,
  },
  description: {
    type: String,
    trim: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  merchant: {
    type: Schema.Types.ObjectId,
    ref: "Merchant",
    default: null,
  },
  updated: Date,
  created: {
    type: Date,
    default: Date.now,
  },
})

export default model("Brand", BrandSchema)
