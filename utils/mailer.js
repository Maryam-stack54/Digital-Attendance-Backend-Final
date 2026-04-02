const nodemailer = require("nodemailer")

//create transporter
const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT),
    secure: true,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
    },

    tls: {
        rejectUnauthorized: false
    }
})

//  GENERAL FUNCTION
const sendEmail = async ({ to, subject, html }) => {
    await transporter.sendMail({
      from: `"Digital Attendance System" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html
    })
  }
  

//function to send the reset email
const sendResetEmail = async(staffEmail, resetLink)=>{
    try {
        const mailOptions = {
            from: `"Digital Attendance System" <${process.env.EMAIL_USER}>`,
            to: staffEmail,
            subject: "Reset Your Password",
            html: `
                <div style="font-family: Arial, sans-serif; line-height: 1.5; color #333;">
                   <h2>Password Reset</h2>
                   <p>Hello,</p>
                   <p>We received a request to reset your password. Click the button below to set a new password. This link will expire in 5 minutes.</p>
                   <p style="text-align: center; margin:30px 0;">
                     <a href="${resetLink}"
                       style="
                          background-color: #4F6EF7;
                          color: white;
                          padding: 12px 24px;
                          text-decoration: none;
                          border-radius: 6px;
                          font-weight: bold;
                       ">Reset Password</a>
                       </p>
                       <p>If you didn't request this, kindly ignore this email.</p>
                       <p>Thanks, <br/></p>
                </div>
                `,
        };

        const info = await transporter.sendMail(mailOptions)
        console.log("Email sent:", info.response)
    } catch (error) {
        console.error("Error sending email:", error)
        throw error
    }
}

module.exports = {sendEmail, sendResetEmail}