/**
 * Order Notification System
 * ─────────────────────────────────────────────────────────────────────────────
 * Sends notifications to the delivery team when a payment succeeds.
 *
 * ✅ Email  — works immediately via Gmail SMTP (nodemailer)
 * ⚙️  SMS    — requires Africa's Talking or Twilio account (see below)
 * ⚙️  WhatsApp — requires WhatsApp Business API (see below)
 *
 * Required env vars (add to .env.local):
 *   GMAIL_USER=exaanesvad@gmail.com
 *   GMAIL_APP_PASSWORD=xxxx xxxx xxxx xxxx   ← Gmail App Password (not your login password)
 *
 * How to get Gmail App Password:
 *   1. Go to myaccount.google.com → Security → 2-Step Verification (enable it)
 *   2. Then go to myaccount.google.com/apppasswords
 *   3. Create app password for "Mail" → copy the 16-char password
 *   4. Paste it as GMAIL_APP_PASSWORD in .env.local
 */

import nodemailer from 'nodemailer';

// ─── Notification recipients ──────────────────────────────────────────────────
const NOTIFICATION_EMAIL   = 'exaanesvad@gmail.com';
const NOTIFICATION_PHONE   = '+233246114671';   // primary — receives SMS + WhatsApp

// ─── Types ────────────────────────────────────────────────────────────────────
export interface OrderItem {
  productName: string;
  quantity:    number;
  unitPrice:   number;
}

export interface OrderNotificationData {
  orderId:       string;
  customerName:  string;
  customerPhone: string;
  totalAmount:   number;
  itemCount:     number;
  address?:      string;
  items?:        OrderItem[];   // full item list for detailed notifications
}

// ─── Email (Gmail SMTP via nodemailer) ────────────────────────────────────────
export async function sendEmailNotification(data: OrderNotificationData): Promise<void> {
  const user     = process.env.GMAIL_USER;
  const password = process.env.GMAIL_APP_PASSWORD;

  if (!user || !password) {
    console.warn('⚠️  Email not sent: GMAIL_USER or GMAIL_APP_PASSWORD not set in .env.local');
    return;
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user, pass: password },
  });

  const shortId = data.orderId.slice(-8).toUpperCase();
  const time    = new Date().toLocaleString('en-GH', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });

  // Build item rows for email
  const itemRowsHtml = data.items && data.items.length > 0
    ? data.items.map(i => `
        <tr>
          <td style="padding:8px 12px;color:#2C2C2C;font-weight:500">${i.productName}</td>
          <td style="padding:8px 12px;color:#767676;text-align:center">× ${i.quantity}</td>
          <td style="padding:8px 12px;color:#2C2C2C;text-align:right">GHS ${(i.unitPrice * i.quantity).toLocaleString()}</td>
        </tr>`).join('')
    : `<tr><td colspan="3" style="padding:8px 12px;color:#767676">${data.itemCount} item${data.itemCount !== 1 ? 's' : ''}</td></tr>`;

  // Plain text item list
  const itemTextLines = data.items && data.items.length > 0
    ? data.items.map(i => `  • ${i.productName} × ${i.quantity} — GHS ${(i.unitPrice * i.quantity).toLocaleString()}`).join('\n')
    : `  ${data.itemCount} item${data.itemCount !== 1 ? 's' : ''}`;

  const html = `
    <div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;border:1px solid #e8e5df;padding:0">
      <div style="background:#4FA637;padding:16px 24px">
        <h2 style="color:#fff;margin:0;font-size:18px">New Order Received 📦</h2>
      </div>
      <div style="padding:24px">

        <!-- Order meta -->
        <table style="width:100%;border-collapse:collapse;font-size:14px;margin-bottom:20px">
          <tr><td style="padding:6px 0;color:#767676;width:140px">Order ID</td>
              <td style="padding:6px 0;font-weight:600;color:#2C2C2C">#${shortId}</td></tr>
          <tr><td style="padding:6px 0;color:#767676">Customer phone</td>
              <td style="padding:6px 0;font-weight:700;color:#2C2C2C;font-size:15px">${data.customerPhone}</td></tr>
          ${data.address ? `
          <tr><td style="padding:6px 0;color:#767676;vertical-align:top">Delivery to</td>
              <td style="padding:6px 0;color:#2C2C2C">${data.address}</td></tr>` : ''}
          <tr><td style="padding:6px 0;color:#767676">Time</td>
              <td style="padding:6px 0;color:#2C2C2C">${time}</td></tr>
        </table>

        <!-- Items ordered -->
        <p style="margin:0 0 8px;font-size:11px;font-weight:600;letter-spacing:1px;text-transform:uppercase;color:#767676">Items ordered</p>
        <table style="width:100%;border-collapse:collapse;font-size:13px;border:1px solid #e8e5df">
          <thead>
            <tr style="background:#f7f5f2">
              <th style="padding:8px 12px;text-align:left;font-size:11px;color:#767676;font-weight:500">Product</th>
              <th style="padding:8px 12px;text-align:center;font-size:11px;color:#767676;font-weight:500">Qty</th>
              <th style="padding:8px 12px;text-align:right;font-size:11px;color:#767676;font-weight:500">Price</th>
            </tr>
          </thead>
          <tbody>
            ${itemRowsHtml}
          </tbody>
          <tfoot>
            <tr style="background:#f7f5f2;border-top:2px solid #e8e5df">
              <td colspan="2" style="padding:10px 12px;font-weight:600;font-size:12px;color:#767676;text-transform:uppercase;letter-spacing:0.5px">Total paid</td>
              <td style="padding:10px 12px;font-weight:700;color:#4FA637;font-size:17px;text-align:right">GHS ${data.totalAmount.toLocaleString()}</td>
            </tr>
          </tfoot>
        </table>

        <div style="margin-top:20px;padding:14px;background:#f0f9ed;border:1px solid rgba(79,166,55,0.2);border-radius:4px">
          <p style="margin:0;font-size:13px;color:#2D6B1E">
            📞 Call or WhatsApp <strong>${data.customerPhone}</strong> to confirm delivery.
          </p>
        </div>
      </div>
    </div>
  `;

  const plainText = `New order received!\n\nOrder: #${shortId}\nPhone: ${data.customerPhone}\n${data.address ? `Delivery: ${data.address}\n` : ''}Time: ${time}\n\nItems:\n${itemTextLines}\n\nTotal: GHS ${data.totalAmount.toLocaleString()}\n\nCall ${data.customerPhone} to confirm delivery.`;

  try {
    await transporter.sendMail({
      from:    `"EXA-ANESVAD Orders" <${user}>`,
      to:      NOTIFICATION_EMAIL,
      subject: `New Order #${shortId} — GHS ${data.totalAmount.toLocaleString()} (${data.itemCount} item${data.itemCount !== 1 ? 's' : ''})`,
      html,
      text:    plainText,
    });
    console.log(`✅ Email sent to ${NOTIFICATION_EMAIL}`);
  } catch (err) {
    console.error('❌ Email send failed:', err);
  }
}

// ─── SMS (Africa's Talking) ───────────────────────────────────────────────────
// To activate: npm install africastalking
// Then add to .env.local:
//   AT_USERNAME=your_username
//   AT_API_KEY=your_api_key
export async function sendSmsNotification(data: OrderNotificationData): Promise<void> {
  const username = process.env.AT_USERNAME;
  const apiKey   = process.env.AT_API_KEY;

  if (!username || !apiKey) {
    console.warn('⚠️  SMS not sent: AT_USERNAME or AT_API_KEY not set. Sign up at africastalking.com');
    return;
  }

  const shortId = data.orderId.slice(-8).toUpperCase();
  const message = `EXA-ANESVAD NEW ORDER\nRef: #${shortId}\nPhone: ${data.customerPhone}\nItems: ${data.itemCount}\nTotal: GHS ${data.totalAmount.toLocaleString()}\nCall customer to confirm delivery.`;

  try {
    // Dynamic import so the app doesn't crash if package isn't installed
    const AfricasTalking = (await import('africastalking' as string)).default;
    const at  = AfricasTalking({ username, apiKey });
    const sms = at.SMS;

    await sms.send({
      to:      [NOTIFICATION_PHONE],
      message,
      from:    'EXAANESVAD',
    });
    console.log(`✅ SMS sent to ${NOTIFICATION_PHONE}`);
  } catch (err: unknown) {
    if (err instanceof Error && err.message.includes('Cannot find module')) {
      console.warn('⚠️  SMS not sent: run "npm install africastalking" to enable SMS');
    } else {
      console.error('❌ SMS send failed:', err);
    }
  }
}

// ─── WhatsApp (WhatsApp Business Cloud API) ───────────────────────────────────
// To activate, add to .env.local:
//   WHATSAPP_TOKEN=your_permanent_token
//   WHATSAPP_PHONE_ID=your_phone_number_id
// Get these from: developers.facebook.com → WhatsApp → Getting Started
export async function sendWhatsAppNotification(data: OrderNotificationData): Promise<void> {
  const token   = process.env.WHATSAPP_TOKEN;
  const phoneId = process.env.WHATSAPP_PHONE_ID;

  if (!token || !phoneId) {
    console.warn('⚠️  WhatsApp not sent: WHATSAPP_TOKEN or WHATSAPP_PHONE_ID not set');
    return;
  }

  const shortId = data.orderId.slice(-8).toUpperCase();
  const toNumber = NOTIFICATION_PHONE.replace('+', '');

  // Build item list for WhatsApp
  const itemLines = data.items && data.items.length > 0
    ? data.items.map(i => `  • ${i.productName} × ${i.quantity} — GHS ${(i.unitPrice * i.quantity).toLocaleString()}`).join('\n')
    : `  ${data.itemCount} item${data.itemCount !== 1 ? 's' : ''}`;

  const body = `*NEW ORDER* 📦\n\n*Ref:* #${shortId}\n*Phone:* ${data.customerPhone}\n${data.address ? `*Delivery:* ${data.address}\n` : ''}\n*Items ordered:*\n${itemLines}\n\n*Total paid:* GHS ${data.totalAmount.toLocaleString()}\n\nCall ${data.customerPhone} to confirm delivery.`;

  try {
    const res = await fetch(
      `https://graph.facebook.com/v19.0/${phoneId}/messages`,
      {
        method:  'POST',
        headers: {
          Authorization:  `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to:   toNumber,
          type: 'text',
          text: { body },
        }),
      }
    );

    if (res.ok) {
      console.log(`✅ WhatsApp sent to ${NOTIFICATION_PHONE}`);
    } else {
      const err = await res.text();
      console.error('❌ WhatsApp send failed:', res.status, err);
    }
  } catch (err) {
    console.error('❌ WhatsApp send failed:', err);
  }
}

// ─── Combined — called by webhook on payment success ─────────────────────────
export async function sendOrderNotifications(data: OrderNotificationData): Promise<void> {
  console.log(`📬 Sending notifications for order ${data.orderId.slice(-8).toUpperCase()}...`);

  // Run all three in parallel — failures in one don't block others
  const results = await Promise.allSettled([
    sendEmailNotification(data),
    sendSmsNotification(data),
    sendWhatsAppNotification(data),
  ]);

  results.forEach((r, i) => {
    const channel = ['Email', 'SMS', 'WhatsApp'][i];
    if (r.status === 'rejected') {
      console.error(`❌ ${channel} notification failed:`, r.reason);
    }
  });

  console.log('📬 Notification dispatch complete.');
}

// ─── Legacy alias (kept for backward compatibility) ───────────────────────────
export const sendOrderNotification = sendSmsNotification;
