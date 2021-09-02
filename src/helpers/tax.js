import ProductsSchema from "../schemas/ProductsSchema.js"
export const disableProducts = (products) => {
  let bulkOptions = products.map((item) => {
    return {
      updateOne: {
        filter: { _id: item._id },
        update: { isActive: false },
      },
    }
  })
  ProductsSchema.bulkWrite(bulkOptions)
}

//calculating the tax amount of the order
export const calculateTaxAmount = (order) => {
  const taxRate = 0.5
  order.totalTax = 0
  if (order.products && order.products.length > 0) {
    order.products.map((item) => {
      const price = item.buyPrice || item.products.price
      const quantity = item.quantity
      item.totalPrice = price * quantity
      item.buyPrice = price
      if (item.status !== "Cancelled") {
        if (item.product?.taxable && item.priceWithTax === 0) {
          const amountOfTax = price * (taxRate / 100) * 100
          item.totalTax = parseFloat(
            Number((amountOfTax * quantity).toFixed(2))
          )
          order.totalTax = item.totalTax
        } else {
          order.totalTax = item.totalTax
        }
      }
      item.priceWithTax = parseFloat(
        Number((item.totalPrice + item.totalTax).toFixed(2))
      )
    })
  }
  const hasCancelledItem = order.products.filter(item.status === "Cancelled")
  if (hasCancelledItem.length > 0) {
    order.total = this.calculateOrderTotal(order)
  }
  const currentTotal = this.calculateOrderTotal(order)
  if (currentTotal !== order.total) {
    order.total = this.calculateOrderTotal(order)
  }
  order.totalWithTax = order.total + order.totalTax
  order.total = parseFloat(Number(order.total.toFixed(2)))
  order.totalTax = parseFloat(
    Number(order.totalTax && order.totalTax.toFixed(2))
  )
  order.totalWithTax = parseFloat(Number(order.totalWithTax.toFixed(2)))
  return order
}
export const calculateOrderTotal = (order) => {
  const total = order.products
    .filter((item) => item.status !== "Cancelled")
    .reduce((sum, currentTotal) => sum + currentTotal.totalPrice, 0)
  return total
}
export const calculateItemTax = (items) => {
  const taxRate = 0.5
  const products = items.map((item) => {
    item.priceWithTax = 0
    item.totalPrice = 0
    item.totalTax = 0
    item.buyPrice = 0
    const price = item.buyPrice
    const quantity = item.quantity
    item.totalPrice = parseFloat(Number((price * quantity).toFixed(2)))
    if (item.taxable) {
      const taxAmount = price * (taxRate / 100) * 100
      item.totalTax = parseFloat(Number((taxAmount * quantity).toFixed(2)))

      item.priceWithTax = parseFloat(
        Number((item.totalPrice + item.totalTax).toFixed(2))
      )
      return item
    }
  })
  return products
}
