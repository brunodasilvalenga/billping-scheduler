import { Resend } from 'resend'
import dotenv from 'dotenv'
import CloudCostReportEmailTemplate from '../templates/emails/report'

dotenv.config()
const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendEmail(email: string, subject: string, content: string) {
  try {
    const response = await resend.emails.send({
      from: 'no-reply@seuslideup.com.br', // Your verified sender email
      to: email,
      subject,
      html: content,
    })
    console.log(`Email sent to ${email}.`)
  } catch (error) {
    console.error('Failed to send email:', error)
  }
}

export async function sendReactEmail(email: string, subject: string, params: any) {
  try {
    const response = await resend.emails.send({
      from: 'no-reply@seuslideup.com.br', // Your verified sender email
      to: email,
      subject,
      react: <CloudCostReportEmailTemplate {...params} />,
    })
    console.log(`Email sent to ${email}.`)
  } catch (error) {
    console.error('Failed to send email:', error)
  }
}
