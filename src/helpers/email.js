import sgMail from "@sendgrid/mail"

sgMail.setApiKey(process.env.SENDGRID_API_KEY)

export const resetEmail = (host, resetToken, user) => {
  const message = {
    to: user.email,
    from: "baxtiyor.abduvoitov.2000@gmail.com", // Use the email address or domain you verified above
    subject: "Reset password",
    text: `You are receiving this email because you have requested to reset the password.
  Please click the foolowing link to reset password``http://${host}/resetPassword/${resetToken}``If you didnt request this please just ignore this email, and your password will remain unchanged`,
  }
  ;async () => {
    try {
      await sgMail.send(message)
    } catch (error) {
      console.log(error)
    }
  }
}
export const confirmResetPasswordEmail = (user) => {
  const message = {
    to: user.email,
    from: "baxtiyor.abduvoitov.2000@gmail.com", // Use the email address or domain you verified above
    subject: "Password changed",
    text: `You are receiving this email because you have changed your password`,
    html: "<strong>Please contact us immediately if you didnt request this changes </strong>",
  }
  //order/status endpoint needed
  //products/advancedFilter enpoint needed
  //products/select needed
  ;async () => {
    try {
      await sgMail.send(message)
    } catch (error) {
      console.log(error)
    }
  }
}
export const merchantSignUp = (host, { resetToken, user }) => {
  const message = {
    to: user.email,
    from: "baxtiyor.abduvoitov.2000@gmail.com", // Use the email address or domain you verified above
    subject: "Merchant registration",
    text: `Congratulations. Your apllication has been accepted.
  Please click the following link to complete your registration``http://${host}/merchant/signUp/${resetToken}`,
  }
  ;async () => {
    try {
      await sgMail.send(message)
    } catch (error) {
      console.log(error)
    }
  }
}
export const merchantWelcome = (name, user) => {
  const message = {
    to: user.email,
    from: "baxtiyor.abduvoitov.2000@gmail.com", // Use the email address or domain you verified above
    subject: "Welcome merchant",
    text: `Welcome ${name} to one of the fastest growing online bax-shop as well as being profitable to merchants as they are able to sell more and more products``Please login to see your dashboard and start selling your products.``Good luck with your business`,
  }
  ;async () => {
    try {
      await sgMail.send(message)
    } catch (error) {
      console.log(error)
    }
  }
}
export const signUpEmail = (user) => {
  const message = {
    to: user.email,
    from: "baxtiyor.abduvoitov.2000@gmail.com", // Use the email address or domain you verified above
    subject: "Account registration",
    text: `Hello ${user.firstName} ${user.lastName}. Thanks for creating account in our online shop. Good luck with your purchase`,
  }
  ;async () => {
    try {
      await sgMail.send(message)
    } catch (error) {
      console.log(error)
    }
  }
}
export const contactEmail = (user) => {
  const message = {
    to: user.email,
    from: "baxtiyor.abduvoitov.2000@gmail.com", // Use the email address or domain you verified above
    subject: "Contact us",
    text: `We received your request. Our team will contact you soon`,
  }
  ;async () => {
    try {
      await sgMail.send(message)
    } catch (error) {
      console.log(error)
    }
  }
}
export const merchantApplicationEmail = (user) => {
  const message = {
    to: user.email,
    from: "baxtiyor.abduvoitov.2000@gmail.com", // Use the email address or domain you verified above
    subject: "Merchant Application",
    text: `We received your request. Our team will contact you soon`,
  }
  ;async () => {
    try {
      await sgMail.send(message)
    } catch (error) {
      console.log(error)
    }
  }
}
export const orderConfirmationEmail = (user) => {
  const message = {
    to: user.email,
    from: "baxtiyor.abduvoitov.2000@gmail.com", // Use the email address or domain you verified above
    subject: "Order confirmation",
    text: `Thank you for shopping with us. We will contact you soon when your order is shipped. Also you can see tracking of your order in your dashboard/orders/trackings`,
  }
  ;async () => {
    try {
      await sgMail.send(message)
    } catch (error) {
      console.log(error)
    }
  }
}
