const nodemailer = require('nodemailer')
const router = require('express').Router()

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  tls: {
    rejectUnauthorized: false
  }
})

router.get('/test', (req, res) => res.json({ ok: true }))

router.post('/', async (req, res) => {
  console.log('Contact route hit with body:', req.body)
  const { name, email, message } = req.body

  if (!name || !email || !message) {
    return res.status(400).json({ error: 'All fields required' })
  }

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: 'lucaslouielau@gmail.com',
    subject: `Portfolio Message from ${name}`,
    html: `
      <h2>New message from your RPG Portfolio</h2>
      <p><strong>From:</strong> ${name}</p>
      <p><strong>Reply to:</strong> ${email}</p>
      <p><strong>Message:</strong></p>
      <p>${message}</p>
    `
  }

  try {
    await transporter.sendMail(mailOptions)
    console.log('Email sent successfully to lucaslouielau@gmail.com')
    return res.status(200).json({ success: true })
  } catch (err) {
    console.error('Email send error:', err.message)
    return res.status(500).json({ error: err.message })
  }
})

module.exports = router