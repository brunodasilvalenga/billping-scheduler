import { Resend } from 'resend'
import dotenv from 'dotenv'

dotenv.config()
const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendEmail(email: string, subject: string, content: string) {
  try {
    const response = await resend.emails.send({
      from: 'your-email@example.com', // Your verified sender email
      to: email,
      subject,
      html: content,
    })
    console.log(`Email sent to ${email}:`, response)
  } catch (error) {
    console.error('Failed to send email:', error)
  }
}
