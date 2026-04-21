# Paystack Integration Setup

This guide explains how to set up Paystack payment processing for your EXA-ANESVAD e-commerce site.

## Prerequisites

1. A Paystack merchant account
2. Access to your Paystack dashboard

## Configuration

### 1. Get Your API Keys

1. Log in to your [Paystack dashboard](https://dashboard.paystack.com/)
2. Go to **Settings** → **API Keys & Webhooks**
3. Copy your **Secret Key** and **Public Key**

### 2. Environment Variables

Add the following to your `.env.local` file:

```env
# Paystack — get from paystack.com dashboard
PAYSTACK_SECRET_KEY="your_secret_key_here"
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY="your_public_key_here"
```

**Important:**
- Keep your secret key secure and never commit it to version control
- Use test keys during development and live keys for production
- The public key is safe to expose to the client

### 3. Database Schema

The Paystack integration requires two additional fields in your Order model:
- `paymentStatus`: Tracks payment state (pending, paid, failed, cancelled)
- `paymentReference`: Stores Paystack transaction reference

These fields are already included in the updated schema.

## How It Works

1. **Checkout Flow**: When a customer submits the checkout form, an order is created with `paymentStatus: pending`
2. **Payment Initialization**: The system calls Paystack's API to initialize a payment and receives an authorization URL
3. **Redirect**: The customer is redirected to Paystack's secure payment page
4. **Callback**: After payment, Paystack redirects back to your confirmation page with a reference
5. **Verification**: The system verifies the payment status with Paystack and updates the order

## Testing

### Test Mode (Simulated Payments)

For development and testing without making real payments, you can enable test mode:

1. Set `PAYSTACK_TEST_MODE="true"` in your `.env.local`
2. Restart your development server
3. Complete checkout - you'll be redirected directly to the confirmation page
4. The order will be marked as paid automatically

```env
# In .env.local
PAYSTACK_TEST_MODE="true"
```

**Important:** Test mode bypasses Paystack entirely and simulates successful payments. Never use in production!

### Paystack Test Keys

For testing with actual Paystack integration (but no real money):

1. Use Paystack's test API keys in your `.env.local`
2. Use test card details from [Paystack's documentation](https://paystack.com/docs/payments/accept-payments/#test-card-details)
3. Common test cards:
   - Visa: `4000 0027 6000 3184` (requires OTP)
   - Mastercard: `5060 6666 6666 6666 6666` (requires OTP)

### Webhooks (Optional)

For real-time payment updates, you can set up webhooks in your Paystack dashboard:
1. Go to **Settings** → **API Keys & Webhooks**
2. Add your webhook URL (e.g., `https://yourdomain.com/api/webhooks/paystack`)
3. Enable the `charge.success` event

## Troubleshooting

### Common Issues

1. **"Payment system not configured"**: Check that `PAYSTACK_SECRET_KEY` is set in your environment
2. **Payment verification fails**: Ensure your callback URL is correct and accessible
3. **CORS errors**: Make sure your frontend URL is whitelisted in Paystack settings

### Debug Mode

Enable debug logging by adding this to your `.env.local`:

```env
DEBUG=paystack:*
```

## Security Measures Implemented

The integration includes several security features to protect your application and customers:

### API Key Protection
- **Secret key never exposed**: The `PAYSTACK_SECRET_KEY` is only used in server-side code
- **Environment variables**: Keys are loaded from `.env.local` which is gitignored
- **Public key only in client**: Only `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY` is exposed to the browser (if needed)

### Input Validation
- **Strict form validation**: All customer inputs are validated using Zod schemas
- **Sanitized data**: Names, emails, and phone numbers are validated against injection attacks
- **Amount verification**: Payment amounts are verified server-side to prevent tampering
- **Reference validation**: Transaction references are validated before API calls

### Payment Security
- **Server-side verification**: All payments are verified server-side with Paystack API
- **Double-payment prevention**: Orders can only be marked as paid once
- **Amount matching**: Paid amount is verified against order total
- **Status tracking**: Payment status is tracked to prevent race conditions

### Best Practices
- **HTTPS required**: Always use HTTPS in production
- **Error handling**: Generic error messages shown to users, detailed logs kept server-side
- **Rate limiting**: Consider implementing rate limiting on checkout endpoints
- **Monitoring**: Monitor failed payments for potential fraud

## Additional Security Recommendations

1. **Enable 2FA** on your Paystack dashboard
2. **Set up webhooks** for real-time payment notifications (more secure than callbacks)
3. **Implement rate limiting** on your checkout endpoints
4. **Monitor transactions** regularly for suspicious activity
5. **Keep dependencies updated** for security patches
6. **Use environment-specific keys**: Test keys for development, live keys for production

## Next Steps

1. Replace test keys with live keys when ready for production
2. Set up webhooks for real-time payment notifications
3. Consider adding payment retry logic for failed transactions
4. Implement order status tracking in your admin dashboard