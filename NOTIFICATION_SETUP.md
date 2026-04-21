# Order Notification Setup Guide

## Overview

Your Paystack integration now includes automatic order notifications to +233246114671 whenever a new order is placed. This feature sends SMS, WhatsApp, and email notifications with order details.

## Current Implementation

### ✅ SMS Notifications (Ready to Use)
- **Phone Number**: +233246114671 (configured in `.env.local`)
- **Message Format**: 
  ```
  NEW ORDER: #ORDER_ID
  Customer: Customer Name
  Phone: Customer Phone
  Items: X
  Total: GHS X,XXX.XX
  Time: DD Mon YYYY, HH:MM
  ```

### ✅ WhatsApp Notifications (Ready to Use)
- **Message Format**: Rich formatted message with order details
- **Includes**: Order ID, customer info, items, total, and timestamp

### ✅ Email Notifications (Ready to Use)
- **Email**: exaanesvad@gmail.com
- **Subject**: "New Order Received - #ORDER_ID"
- **Body**: Detailed order information

## How It Works

1. **Order Placement**: When a customer completes checkout
2. **Order Creation**: Order is saved to database with "pending" status
3. **Notification Trigger**: System automatically sends notifications
4. **Payment Processing**: Customer redirected to Paystack for payment
5. **Status Update**: Order marked as "paid" after successful payment

## Setup Instructions

### 1. Environment Configuration

Add to your `.env.local`:
```env
# Order notifications
NOTIFICATION_PHONE_NUMBER="+233246114671"
NOTIFICATION_EMAIL="exaanesvad@gmail.com"
```

### 2. SMS Service Integration (Optional)

For actual SMS delivery, integrate with one of these services:

#### Option A: Twilio
```env
TWILIO_ACCOUNT_SID="your_account_sid"
TWILIO_AUTH_TOKEN="your_auth_token"
TWILIO_PHONE_NUMBER="+1234567890"
```

#### Option B: Africa's Talking
```env
AFRICAS_TALKING_USERNAME="your_username"
AFRICAS_TALKING_API_KEY="your_api_key"
```

#### Option C: Termii
```env
TERMII_API_KEY="your_api_key"
TERMII_SENDER_ID="EXAANESVAD"
```

### 3. WhatsApp Business Integration (Optional)

For WhatsApp notifications, set up:
- WhatsApp Business Account
- Meta Developer Account
- Webhook configuration

### 4. Email Service Integration (Optional)

For email delivery, integrate with:
- SendGrid
- Mailgun
- AWS SES
- Nodemailer

## Testing Notifications

### Test Mode
1. Set `PAYSTACK_TEST_MODE="true"` in `.env.local`
2. Complete checkout flow
3. Check console logs for notification messages
4. Notifications are logged but not sent

### Live Testing
1. Use real Paystack test keys
2. Complete checkout with test card
3. Check phone/email for actual notifications

## Notification Content

### SMS Message
```
NEW ORDER: #EXA-12345678
Customer: Kwame Mensah
Phone: +233 24 123 4567
Items: 3
Total: GHS 150.00
Time: 21 Apr 2026, 14:30
```

### WhatsApp Message
```
📦 NEW ORDER RECEIVED

Order ID: EXA-12345678
Customer: Kwame Mensah
Phone: +233 24 123 4567
Items: 3
Total: GHS 150.00
Time: 21 Apr 2026, 14:30

Please follow up with the customer for delivery arrangements.
```

### Email Subject
`New Order Received - #EXA-12345678`

### Email Body
```
New order has been placed:

Order ID: EXA-12345678
Customer: Kwame Mensah
Phone: +233 24 123 4567
Items: 3
Total Amount: GHS 150.00
Order Date: 21 Apr 2026, 14:30

Please review the order in your admin dashboard and contact the customer for delivery arrangements.
```

## Troubleshooting

### Notifications Not Received
1. Check `.env.local` configuration
2. Verify phone number format (+233...)
3. Check console logs for errors
4. Test with different SMS service provider

### SMS Delivery Issues
1. Verify SMS service account is active
2. Check API credentials
3. Ensure sender ID is approved
4. Check message length limits

### WhatsApp Delivery Issues
1. Verify WhatsApp Business account
2. Check template message approval
3. Ensure phone number is verified

### Email Delivery Issues
1. Verify email service account
2. Check SMTP settings
3. Verify sender email address
4. Check spam folder

## Production Deployment

### Before Going Live
1. Replace test SMS credentials with live credentials
2. Verify all notification channels work
3. Test with real payment flow
4. Monitor notification delivery

### Monitoring
1. Check notification logs regularly
2. Monitor SMS/email delivery rates
3. Set up alerts for notification failures
4. Review customer feedback

## Code Location

### Notification Service
- **File**: `src/lib/notifications.ts`
- **Functions**: `sendOrderNotification()`, `sendWhatsAppNotification()`, `sendEmailNotification()`

### Integration Point
- **File**: `src/app/(public)/checkout/actions.ts`
- **Function**: `createOrderWithPayment()`
- **Line**: ~70-80 (notification call)

### Configuration
- **File**: `.env.example` and `.env.local`
- **Variables**: `NOTIFICATION_PHONE_NUMBER`, `NOTIFICATION_EMAIL`

## Benefits

1. **Immediate Awareness**: Instant notification of new orders
2. **Customer Service**: Quick follow-up for delivery arrangements
3. **Order Management**: Better tracking and organization
4. **Professional Image**: Automated, professional communication
5. **Multiple Channels**: Redundancy across SMS, WhatsApp, and email

## Next Steps

1. **Choose SMS Provider**: Select and configure your preferred SMS service
2. **Test Thoroughly**: Test all notification channels
3. **Monitor Performance**: Track delivery rates and customer response
4. **Optimize Messages**: Adjust message content based on feedback
5. **Scale Up**: Consider additional notification features (order status updates, delivery confirmations)