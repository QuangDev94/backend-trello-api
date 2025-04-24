const brevo = require("@getbrevo/brevo")
const { env } = require("~/config/environment")

let apiInstance = new brevo.TransactionalEmailsApi()
// Doc config theo từng ngôn ngữ khác nhau ở Brevo dashboard > account > SMTP & API > API keys
let apiKey = apiInstance.authentications["apiKey"]
apiKey.apiKey = env.BREVO_API_KEY

const sendEmail = async (recipientEmail, customSubject, htmlContent) => {
  let sendSmtpEmail = new brevo.SendSmtpEmail()

  //   Setting tài khoản gửi email
  sendSmtpEmail.sender = {
    email: env.ADMIN_EMAIL_ADDRESS,
    name: env.ADMIN_EMAIL_NAME,
  }
  //   Setting những tài khoản nhận email
  sendSmtpEmail.to = [{ email: recipientEmail }]
  //   tieu de cua email
  sendSmtpEmail.subject = customSubject
  //   Noi dung email dang HTML
  sendSmtpEmail.htmlContent = htmlContent

  //   Goi hanh dong gui email
  return apiInstance.sendTransacEmail(sendSmtpEmail)
}

export const BrevoProvider = {
  sendEmail,
}
