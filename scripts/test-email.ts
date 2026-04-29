import "dotenv/config"
import nodemailer from "nodemailer"

const RECIPIENT = "xv.neer@gmail.com"

async function testEmail() {
  console.log("📧 Testing SMTP email send...\n")

  if (!process.env.SMTP_APP_PASSWORD) {
    console.error("❌ SMTP_APP_PASSWORD not set in environment")
    process.exit(1)
  }

  const transporter = nodemailer.createTransport({
    host: "smtp.office365.com",
    port: 587,
    secure: false,
    requireTLS: true,
    auth: {
      user: "notifications@wahdomrania.sa",
      pass: process.env.SMTP_APP_PASSWORD,
    },
    tls: {
      ciphers: "TLSv1.2",
      minVersion: "TLSv1.2",
    },
  })

  try {
    console.log("🔌 Verifying SMTP connection...")
    await transporter.verify()
    console.log("✅ SMTP connection OK")

    console.log(`\n✉️  Sending test email to ${RECIPIENT}...`)
    const info = await transporter.sendMail({
      from: '"Wahd Omrania Notifications" <notifications@wahdomrania.sa>',
      to: RECIPIENT,
      subject: "Test Email from Wahd Omrania Internal System",
      text: `Test email sent at ${new Date().toISOString()}\n\nIf you see this, SMTP works.`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #1a1a1a;">SMTP Test Email</h2>
          <p>Test email sent at <strong>${new Date().toISOString()}</strong></p>
          <p>If you see this, SMTP works.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
          <p style="color: #888; font-size: 12px;">Wahd Omrania Internal System</p>
        </div>
      `,
    })

    console.log("✅ Email sent!")
    console.log("   Message ID:", info.messageId)
    console.log("   Accepted:  ", info.accepted)
    console.log("   Rejected:  ", info.rejected)
    console.log("   Response:  ", info.response)
    console.log("\n🎉 Test passed.\n")
  } catch (error) {
    console.error("❌ Error:", error)
    process.exit(1)
  }
}

testEmail()
