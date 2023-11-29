const nodemailer = require('nodemailer')
const sgmail = require('@sendgrid/mail')
const sendResetPasswordEmail = async ({ email, token, origin}) => {
    sgmail.setApiKey(process.env.SENDGRID_API_KEY)
    const resetLink = `${origin}/user/forgot-password?token=${token}&email=${email}`
    const message = `<p>Reset password by clicking on the following link: <a href="${resetLink}">reset password</p>`
    const mail = {
        to: email,
        from: 'quanbui021001@gmail.com',
        subject: 'Reset Password',
        html: message
    }
    try {
        await sgmail.send(mail);
    } catch (error) {
        console.error(error);
    if (error.response) {
          console.error(error.response.body)
      }
  }
 
}

module.exports = sendResetPasswordEmail