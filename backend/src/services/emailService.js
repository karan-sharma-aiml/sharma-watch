const nodemailer = require('nodemailer');

const CLIENT = (process.env.CLIENT_URL || 'http://localhost:3000').replace(/\/$/, '');
const WHATSAPP_NUMBER = '9779827286613';

const createTransporter = () =>
  nodemailer.createTransport({
    host:   'smtp.gmail.com',
    port:   587,
    secure: false,
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
    tls: { rejectUnauthorized: false },
  });

const verifyEmailConnection = async () => {
  try {
    await createTransporter().verify();
    console.log('✅ [Email] Gmail connected —', process.env.GMAIL_USER);
    return true;
  } catch (err) {
    console.error('❌ [Email] Failed:', err.message);
    return false;
  }
};

// ── OTP Email ──────────────────────────────────────
const sendOTPEmail = async (name, email, otp) => {
  const transporter = createTransporter();
  console.log('\n📧 Sending OTP to:', email, '| OTP:', otp);

  const mailOptions = {
    from:    `"Sharma Watch Store" <${process.env.GMAIL_USER}>`,
    to:      email,
    subject: `${otp} is your Sharma Watch Store verification code`,
    html: `
<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;padding:40px 16px;">
  <tr><td align="center">
    <table width="520" cellpadding="0" cellspacing="0"
      style="background:#111;border:1px solid #2a2a2a;border-radius:20px;overflow:hidden;max-width:100%;">
      <tr>
        <td style="background:linear-gradient(135deg,#0d0d0d,#1c1500);padding:28px;text-align:center;border-bottom:1px solid #2a2a2a;">
          <p style="color:#d4af37;font-size:22px;font-weight:800;letter-spacing:5px;margin:0;">SHARMA</p>
          <p style="color:#555;font-size:10px;letter-spacing:4px;margin:5px 0 0;">WATCH STORE · BIRGUNJ, NEPAL</p>
        </td>
      </tr>
      <tr>
        <td style="padding:36px 32px;">
          <h2 style="color:#fff;font-size:22px;font-weight:700;margin:0 0 12px;">Verify Your Email</h2>
          <p style="color:#888;font-size:14px;line-height:1.8;margin:0 0 28px;">
            Hello <strong style="color:#fff;">${name}</strong>, your OTP code is:
          </p>
          <div style="text-align:center;margin:0 0 28px;">
            <div style="display:inline-block;background:#0d0d0d;border:2px solid #d4af37;border-radius:16px;padding:20px 36px;">
              <p style="color:#d4af37;font-size:36px;font-weight:800;letter-spacing:8px;margin:0;font-family:monospace;">${otp}</p>
              <p style="color:#666;font-size:11px;margin:8px 0 0;">Expires in <strong style="color:#d4af37;">10 minutes</strong></p>
            </div>
          </div>
          <div style="background:#0d0d0d;border:1px solid #2a2a2a;border-left:3px solid #ef4444;border-radius:0 10px 10px 0;padding:12px 16px;">
            <p style="color:#ef4444;font-size:12px;font-weight:700;margin:0 0 4px;">🔒 Security Notice</p>
            <p style="color:#666;font-size:12px;margin:0;">Never share this OTP with anyone. We will never ask for your OTP.</p>
          </div>
        </td>
      </tr>
      <tr>
        <td style="background:#0d0d0d;padding:18px 32px;border-top:1px solid #2a2a2a;text-align:center;">
          <p style="color:#444;font-size:11px;margin:0;">
            © ${new Date().getFullYear()} Sharma Watch Store · Birgunj, Nepal<br/>
            <a href="https://wa.me/${WHATSAPP_NUMBER}" style="color:#d4af37;">WhatsApp Support</a>
          </p>
        </td>
      </tr>
    </table>
  </td></tr>
</table>
</body>
</html>`,
  };

  const result = await transporter.sendMail(mailOptions);
  console.log('✅ OTP email sent! ID:', result.messageId);
  return result;
};

// ── Password Reset Email ───────────────────────────
const sendPasswordResetEmail = async (user, plainToken) => {
  const transporter  = createTransporter();
  const link = `${CLIENT}/reset-password?token=${encodeURIComponent(plainToken)}`;

  const mailOptions = {
    from:    `"Sharma Watch Store" <${process.env.GMAIL_USER}>`,
    to:      user.email,
    subject: 'Reset Your Password — Sharma Watch Store',
    html: `
<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;padding:40px 16px;">
  <tr><td align="center">
    <table width="520" cellpadding="0" cellspacing="0"
      style="background:#111;border:1px solid #2a2a2a;border-radius:20px;overflow:hidden;max-width:100%;">
      <tr>
        <td style="background:linear-gradient(135deg,#0d0d0d,#1c1500);padding:28px;text-align:center;border-bottom:1px solid #2a2a2a;">
          <p style="color:#d4af37;font-size:22px;font-weight:800;letter-spacing:5px;margin:0;">SHARMA</p>
          <p style="color:#555;font-size:10px;letter-spacing:4px;margin:5px 0 0;">WATCH STORE</p>
        </td>
      </tr>
      <tr>
        <td style="padding:36px 32px;">
          <h2 style="color:#fff;font-size:22px;font-weight:700;margin:0 0 14px;">Reset Your Password</h2>
          <p style="color:#888;font-size:14px;line-height:1.8;margin:0 0 28px;">
            Hello <strong style="color:#fff;">${user.name}</strong>, click below to reset your password.
            Link expires in <strong style="color:#d4af37;">1 hour</strong>.
          </p>
          <div style="text-align:center;margin:0 0 28px;">
            <a href="${link}" style="display:inline-block;background:#d4af37;color:#000;text-decoration:none;padding:14px 40px;border-radius:10px;font-weight:700;font-size:15px;">Reset Password</a>
          </div>
          <p style="color:#555;font-size:11px;">Or copy: <a href="${link}" style="color:#d4af37;word-break:break-all;">${link}</a></p>
        </td>
      </tr>
      <tr>
        <td style="background:#0d0d0d;padding:18px;border-top:1px solid #2a2a2a;text-align:center;">
          <p style="color:#444;font-size:11px;margin:0;">© ${new Date().getFullYear()} Sharma Watch Store · Birgunj, Nepal</p>
        </td>
      </tr>
    </table>
  </td></tr>
</table>
</body>
</html>`,
  };

  const result = await transporter.sendMail(mailOptions);
  console.log('✅ Reset email sent! ID:', result.messageId);
  return result;
};

// ── Delivery Confirmation Email ────────────────────
const sendDeliveryEmail = async (user, order) => {
  const transporter = createTransporter();
  const waMsg       = encodeURIComponent(
    `Hello Sharma Watch Store,\n\nI need assistance regarding my order.\n\nOrder ID: ${order.orderNumber}\n\nPlease help me.`
  );
  const waLink = `https://wa.me/${WHATSAPP_NUMBER}?text=${waMsg}`;

  console.log('\n📧 Sending delivery confirmation to:', user.email);

  const itemRows = order.items.map((item) => `
    <tr>
      <td style="padding:10px 0;border-bottom:1px solid #1a1a1a;color:#ccc;font-size:13px;">
        ${item.product?.name || 'Product'}
      </td>
      <td style="padding:10px 0;border-bottom:1px solid #1a1a1a;color:#aaa;font-size:13px;text-align:center;">
        ×${item.quantity}
      </td>
      <td style="padding:10px 0;border-bottom:1px solid #1a1a1a;color:#d4af37;font-size:13px;text-align:right;font-weight:700;">
        NPR ${(item.price * item.quantity).toLocaleString()}
      </td>
    </tr>
  `).join('');

  const mailOptions = {
    from:    `"Sharma Watch Store" <${process.env.GMAIL_USER}>`,
    to:      user.email,
    subject: `✅ Order Delivered! ${order.orderNumber} — Sharma Watch Store`,
    html: `
<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;padding:40px 16px;">
  <tr><td align="center">
    <table width="560" cellpadding="0" cellspacing="0"
      style="background:#111;border:1px solid #2a2a2a;border-radius:20px;overflow:hidden;max-width:100%;">

      <!-- Header -->
      <tr>
        <td style="background:linear-gradient(135deg,#0d0d0d,#1c1500);padding:28px;text-align:center;border-bottom:1px solid #2a2a2a;">
          <p style="color:#d4af37;font-size:22px;font-weight:800;letter-spacing:5px;margin:0;">SHARMA</p>
          <p style="color:#555;font-size:10px;letter-spacing:4px;margin:5px 0 0;">WATCH STORE · BIRGUNJ, NEPAL</p>
        </td>
      </tr>

      <!-- Delivered banner -->
      <tr>
        <td style="background:rgba(34,197,94,0.1);border-bottom:1px solid rgba(34,197,94,0.2);padding:20px;text-align:center;">
          <p style="font-size:28px;margin:0 0 6px;">✅</p>
          <h2 style="color:#22c55e;font-size:20px;font-weight:700;margin:0 0 4px;">Order Delivered!</h2>
          <p style="color:#888;font-size:13px;margin:0;">Your order has been successfully delivered.</p>
        </td>
      </tr>

      <!-- Body -->
      <tr>
        <td style="padding:32px;">
          <p style="color:#888;font-size:14px;line-height:1.8;margin:0 0 20px;">
            Hello <strong style="color:#fff;">${user.name}</strong>,<br/>
            Thank you for shopping at Sharma Watch Store! Your order has been delivered.
          </p>

          <!-- Order Info -->
          <div style="background:#0d0d0d;border:1px solid #2a2a2a;border-radius:12px;padding:16px;margin-bottom:20px;">
            <div style="display:flex;justify-content:space-between;margin-bottom:8px;">
              <span style="color:#888;font-size:12px;">Order Number</span>
              <span style="color:#d4af37;font-weight:700;font-size:13px;">${order.orderNumber}</span>
            </div>
            <div style="display:flex;justify-content:space-between;margin-bottom:8px;">
              <span style="color:#888;font-size:12px;">Delivery Type</span>
              <span style="color:#fff;font-size:13px;text-transform:capitalize;">${order.deliveryType}</span>
            </div>
            <div style="display:flex;justify-content:space-between;">
              <span style="color:#888;font-size:12px;">Status</span>
              <span style="color:#22c55e;font-weight:700;font-size:13px;">✅ Delivered</span>
            </div>
          </div>

          <!-- Items -->
          <h3 style="color:#d4af37;font-size:12px;letter-spacing:2px;font-weight:700;margin:0 0 12px;text-transform:uppercase;">Items Ordered</h3>
          <table width="100%" cellpadding="0" cellspacing="0">
            ${itemRows}
          </table>

          <!-- Total -->
          <div style="background:#0d0d0d;border:1px solid #2a2a2a;border-radius:12px;padding:16px;margin-top:16px;">
            ${order.shippingCharge > 0 ? `
            <div style="display:flex;justify-content:space-between;margin-bottom:6px;">
              <span style="color:#888;font-size:12px;">Shipping</span>
              <span style="color:#ccc;font-size:12px;">NPR ${order.shippingCharge}</span>
            </div>` : `
            <div style="display:flex;justify-content:space-between;margin-bottom:6px;">
              <span style="color:#888;font-size:12px;">Shipping</span>
              <span style="color:#22c55e;font-size:12px;">FREE</span>
            </div>`}
            ${order.expressCharge > 0 ? `
            <div style="display:flex;justify-content:space-between;margin-bottom:6px;">
              <span style="color:#888;font-size:12px;">Express Delivery</span>
              <span style="color:#ccc;font-size:12px;">NPR ${order.expressCharge}</span>
            </div>` : ''}
            <div style="display:flex;justify-content:space-between;padding-top:8px;border-top:1px solid #2a2a2a;">
              <span style="color:#fff;font-weight:700;font-size:14px;">Total Paid</span>
              <span style="color:#d4af37;font-weight:800;font-size:16px;">NPR ${order.totalAmount.toLocaleString()}</span>
            </div>
          </div>

          <!-- Thank you -->
          <div style="text-align:center;margin:24px 0 0;">
            <p style="color:#888;font-size:14px;margin:0 0 16px;">
              Thank you for choosing <strong style="color:#d4af37;">Sharma Watch Store</strong>!<br/>
              We hope you love your new timepiece. 🕰️
            </p>
          </div>
        </td>
      </tr>

      <!-- WhatsApp Support -->
      <tr>
        <td style="background:#0d0d0d;border-top:1px solid #2a2a2a;padding:20px 32px;text-align:center;">
          <p style="color:#666;font-size:12px;margin:0 0 12px;">
            Need help with your order? Contact us on WhatsApp.
          </p>
          <a href="${waLink}"
            style="display:inline-block;background:#25D366;color:#fff;text-decoration:none;padding:10px 28px;border-radius:8px;font-weight:700;font-size:13px;">
            💬 Chat on WhatsApp
          </a>
          <p style="color:#444;font-size:11px;margin:12px 0 0;">
            © ${new Date().getFullYear()} Sharma Watch Store · Birgunj, Nepal
          </p>
        </td>
      </tr>

    </table>
  </td></tr>
</table>
</body>
</html>`,
  };

  const result = await transporter.sendMail(mailOptions);
  console.log('✅ Delivery email sent! ID:', result.messageId);
  return result;
};

module.exports = {
  sendOTPEmail,
  sendPasswordResetEmail,
  sendDeliveryEmail,
  verifyEmailConnection,
};