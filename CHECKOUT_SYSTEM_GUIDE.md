# EXA-ANESVAD — Checkout System Guide
> Production-ready, low-friction checkout for physical goods delivery in Ghana

---

## Table of Contents
1. [UX Flow (Step-by-Step)](#1-ux-flow)
2. [Minimum Fields & Why](#2-minimum-fields)
3. [Backend Architecture](#3-backend-architecture)
4. [Paystack Payload Reference](#4-paystack-payload-reference)
5. [Returning Users](#5-returning-users)
6. [Mobile UX Tips for Ghana](#6-mobile-ux-tips-for-ghana)
7. [Edge Cases & Error Handling](#7-edge-cases)
8. [Webhook Setup](#8-webhook-setup)
9. [Environment Variables](#9-environment-variables)
10. [Testing Checklist](#10-testing-checklist)

---

## 1. UX Flow

```
[Cart page]
    │
    ▼
[Checkout page]  ← Single step, 2 required fields
    │
    │  User fills:
    │    ✅ Phone number  (pre-filled if returning user)
    │    ✅ Delivery location  (pre-filled if returning user)
    │    ○  Special instructions  (collapsed <details>, optional)
    │
    │  User clicks: "Pay GHS X →"
    │
    ▼
[Server action: createOrderWithPayment]
    │  1. Validate phone + address
    │  2. Generate reference: EXA-<base36-ts>-<random6>
    │  3. Derive synthetic email: <digits>@orders.exaanesvad.com
    │  4. Create Order in DB (status = pending)
    │  5. Fire admin notification (non-blocking)
    │  6. Call Paystack /transaction/initialize
    │     channels: ['card', 'mobile_money']
    │
    ▼
[Paystack payment page]
    │  User pays via card OR mobile money (MTN/Vodafone/AirtelTigo)
    │
    ├─ Success → redirect to /checkout/confirmation?ref=EXA-...
    └─ Abandoned/Failed → redirect to /checkout/confirmation?ref=EXA-...
                          (verifyPayment detects the failure)

[Confirmation page]
    │  Calls verifyPayment(ref) → Paystack API
    │  ✅ Paid   → show order summary + "What happens next"
    │  ❌ Failed → show error + "Try payment again" button
    │
    │  Webhook (background, authoritative):
    └─ POST /api/webhooks/paystack → marks order paid/failed
       (catches users who close browser before redirect)
```

---

## 2. Minimum Fields

| Field | Required | Collected from | Why |
|-------|----------|---------------|-----|
| **Phone number** | ✅ Yes | User | Primary identity + delivery contact |
| **Delivery location** | ✅ Yes | User | Fulfillment — where to send the goods |
| Special instructions | ○ Optional | User (collapsed) | Gate colour, preferred time, etc. |
| Email | ❌ Never | Auto-generated | Paystack requires it; we derive it from phone |
| Name | ❌ Never | Not collected | Reduces friction; phone is the identity |

### Why no name?
In Ghana, delivery is confirmed by phone call/WhatsApp. The name adds friction without adding value — your team will call the number to confirm anyway.

### Why auto-generate email?
Paystack's API requires an `email` field. We derive it deterministically:
```
+233241234567  →  233241234567@orders.exaanesvad.com
```
Set `ORDER_EMAIL_DOMAIN` in `.env.local` to customise the domain.

---

## 3. Backend Architecture

### Order creation flow (`actions.ts`)

```typescript
// 1. Validate — only phone + address required
const OrderSchema = z.object({
  customerPhone: z.string().min(7).max(20),
  address:       z.string().min(5).max(500),
  notes:         z.string().max(1000).optional(),
});

// 2. Generate collision-resistant reference
// Format: EXA-<base36-timestamp>-<6-char-random>
// Example: EXA-LKJH3F-X7QP2A
function generateReference(): string { ... }

// 3. Derive synthetic email (never ask user)
function phoneToEmail(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  return `${digits}@orders.exaanesvad.com`;
}

// 4. Create order BEFORE calling Paystack
// This ensures the order exists even if Paystack is slow
const order = await prisma.order.create({ ... });

// 5. Initialize Paystack with channels
await initializePayment({
  email:    syntheticEmail,
  amount:   total,          // GHS — converted to pesewas internally
  reference,
  callbackUrl: `${baseUrl}/checkout/confirmation?ref=${reference}`,
  channels: ['card', 'mobile_money'],
  metadata: {
    order_id:         order.id,
    customer_phone:   data.customerPhone,
    delivery_address: data.address,
    custom_fields: [ ... ]  // shown in Paystack dashboard
  }
});
```

### Data separation principle
- **Order data** (phone, address, items, total) → stored in your DB immediately
- **Payment data** (card details, authorization) → handled entirely by Paystack
- You never see or store card numbers. Paystack handles PCI compliance.

### Reference format
```
EXA-LKJH3F-X7QP2A
│   │       └── 6 random chars (collision buffer)
│   └────────── base-36 timestamp (ms since epoch)
└────────────── app prefix (easy to identify in Paystack dashboard)
```

---

## 4. Paystack Payload Reference

### Initialize transaction
```json
POST https://api.paystack.co/transaction/initialize
Authorization: Bearer sk_live_...

{
  "email":        "233241234567@orders.exaanesvad.com",
  "amount":       5000,
  "currency":     "GHS",
  "reference":    "EXA-LKJH3F-X7QP2A",
  "callback_url": "https://yourdomain.com/checkout/confirmation?ref=EXA-LKJH3F-X7QP2A",
  "channels":     ["card", "mobile_money"],
  "metadata": {
    "order_id":         "clxyz123...",
    "customer_phone":   "+233241234567",
    "delivery_address": "Madina Market, near Total, Accra",
    "custom_fields": [
      { "display_name": "Order ID",  "variable_name": "order_id",         "value": "clxyz123..." },
      { "display_name": "Phone",     "variable_name": "customer_phone",   "value": "+233241234567" },
      { "display_name": "Delivery",  "variable_name": "delivery_address", "value": "Madina Market..." }
    ]
  }
}
```

### Response
```json
{
  "status": true,
  "message": "Authorization URL created",
  "data": {
    "authorization_url": "https://checkout.paystack.com/...",
    "access_code": "...",
    "reference": "EXA-LKJH3F-X7QP2A"
  }
}
```

### Verify transaction
```
GET https://api.paystack.co/transaction/verify/EXA-LKJH3F-X7QP2A
Authorization: Bearer sk_live_...
```

### Key response fields
```json
{
  "data": {
    "status":    "success",   // "success" | "failed" | "abandoned"
    "amount":    5000,        // in pesewas (GHS × 100)
    "channel":   "mobile_money",
    "reference": "EXA-LKJH3F-X7QP2A",
    "metadata":  { "order_id": "...", "customer_phone": "..." }
  }
}
```

> ⚠️ **Important**: Paystack does NOT reliably return customer name or phone in the verify response. Always use your own DB record (looked up by `reference`) as the source of truth for customer identity.

---

## 5. Returning Users

### How it works
On successful checkout, the customer's phone and delivery address are saved to `localStorage` under the key `exa-customer-profile`:

```json
{
  "phone":   "+233241234567",
  "address": "Madina Market, near Total filling station, Accra",
  "notes":   "Call before coming"
}
```

On the next visit:
1. Profile is loaded from localStorage on mount
2. Fields are auto-filled via `ref` (no React state re-render needed)
3. A green "Welcome back" banner appears with an "Edit" option
4. User can dismiss the banner and edit freely

### Privacy note
- Data is stored only in the user's own browser (localStorage)
- No server-side session or account required
- User can clear it by clearing browser data
- Profile is updated on every successful checkout

---

## 6. Mobile UX Tips for Ghana

### Implemented in this system

| Tip | Implementation |
|-----|---------------|
| **Font size ≥ 15px on inputs** | Prevents iOS auto-zoom on focus |
| **`inputMode="tel"`** | Opens numeric keypad on Android/iOS |
| **`autoComplete="tel"`** | Allows browser/OS autofill |
| **`-webkit-appearance: none`** | Removes iOS default input styling |
| **`-webkit-tap-highlight-color: transparent`** | Removes grey flash on button tap |
| **Phone prefix shown visually** | `🇬🇭 +233` prefix — user types local number |
| **Inline phone validation** | Validates on blur, not on submit |
| **Notes field collapsed** | `<details>` — reduces visual noise on small screens |
| **Single section** | One card, 2 fields — no scrolling required |
| **Large tap target on submit** | 18px padding, full width |
| **Mobile money channels** | `channels: ['card', 'mobile_money']` — MTN/Vodafone/AirtelTigo |
| **Spinner on submit** | Prevents double-tap while processing |

### Additional recommendations

**Network resilience**
- Ghana mobile networks can be slow/intermittent
- The order is saved to DB *before* Paystack is called — if Paystack times out, the order still exists and can be retried
- The `retryPayment` action generates a fresh reference for failed orders

**Mobile money tips**
- MTN MoMo is dominant in Ghana — it will appear first on Paystack's page
- Users need their MoMo PIN, not a card
- Paystack handles the USSD prompt automatically when `mobile_money` channel is included

**Reduce abandonment**
- Show the total prominently in the submit button: `Pay GHS 50 →`
- The payment hint (`🔒 Pay securely with card or mobile money`) sets expectations before redirect
- The confirmation page shows "What happens next" so users know a human will call them

---

## 7. Edge Cases

### Payment failures

| Scenario | Handling |
|----------|---------|
| User closes browser during payment | Webhook marks order failed/paid server-side |
| Paystack times out | Order saved as `pending`; user sees error; can retry |
| Payment abandoned on Paystack page | `verifyPayment` detects `abandoned` status; shows retry button |
| Card declined | `verifyPayment` detects `failed`; shows retry button |
| Amount mismatch | Both `verifyPayment` and webhook check amount; marks failed if mismatch |
| Double payment (user pays twice) | Idempotency guard: `if (order.paymentStatus === 'paid') return already processed` |
| Webhook arrives before redirect | Idempotency guard handles this gracefully |

### Wrong phone number
- Validation: 9–12 digits, Ghanaian format
- Normalisation: `0241234567` → `+233241234567` before saving
- If wrong number given: your team calls, gets no answer, contacts via order ID
- **Recommendation**: Add a "Confirm phone" step in your admin dashboard before dispatching

### Unreachable delivery location
- Address is free-text — no geocoding required
- Hint text: "Landmark, street, area, city — the more detail, the faster we deliver"
- If location is unclear: your team calls the phone number to clarify
- **Recommendation**: Add an `address_confirmed` boolean to the Order model for your team to tick

### Cart is empty
- Submit button is disabled when `items.length === 0`
- Server action also validates: `if (!cartItems.length) return error`

### Paystack API down
- `initializePayment` catches HTTP errors and returns `{ success: false, error: '...' }`
- Order is marked `failed` in DB
- User sees error banner with message
- Order can be retried via `retryPayment` action

### User navigates back after payment
- Confirmation page re-verifies on every load
- If already paid: `alreadyProcessed: true` → shows "Order already confirmed"
- Cart is cleared only once (on first successful verification)

---

## 8. Webhook Setup

The webhook at `/api/webhooks/paystack` is the **authoritative** payment confirmation. It handles cases where the user closes the browser before the redirect completes.

### Setup steps

1. Log in to [Paystack Dashboard](https://dashboard.paystack.com)
2. Go to **Settings → API Keys & Webhooks**
3. Set **Webhook URL** to:
   ```
   https://yourdomain.com/api/webhooks/paystack
   ```
4. Save

### Security
- Every webhook request is verified using HMAC-SHA512 with your `PAYSTACK_SECRET_KEY`
- Requests with invalid signatures are rejected with `401`
- Always returns `200` for known events (even ignored ones) to prevent Paystack retries

### Events handled
| Event | Action |
|-------|--------|
| `charge.success` | Mark order `paid`, verify amount |
| `charge.failed` | Mark order `failed` |
| All others | Ignored, return `200` |

### Testing webhooks locally
Use [ngrok](https://ngrok.com) or [Paystack's test mode](https://paystack.com/docs/payments/test-payments/):
```bash
ngrok http 3003
# Then set webhook URL to: https://abc123.ngrok.io/api/webhooks/paystack
```

---

## 9. Environment Variables

Add these to `.env.local`:

```bash
# ── Paystack ──────────────────────────────────────────────────────────────────
PAYSTACK_SECRET_KEY=sk_live_xxxxxxxxxxxxxxxxxxxx   # or sk_test_... for testing
PAYSTACK_TEST_MODE=false                            # set true to skip Paystack entirely

# ── App URLs ──────────────────────────────────────────────────────────────────
NEXT_PUBLIC_BASE_URL=https://yourdomain.com         # used for callback URLs
# or
NEXTAUTH_URL=https://yourdomain.com

# ── Synthetic email domain ────────────────────────────────────────────────────
ORDER_EMAIL_DOMAIN=orders.exaanesvad.com            # domain for auto-generated emails
# Result: 233241234567@orders.exaanesvad.com

# ── Notifications ─────────────────────────────────────────────────────────────
NOTIFICATION_PHONE_NUMBER=+233246114671
NOTIFICATION_EMAIL=exaanesvad@gmail.com
```

### Test mode
Set `PAYSTACK_TEST_MODE=true` to bypass Paystack entirely during development:
- Orders are created in DB normally
- Payment redirect goes directly to confirmation page
- Order is marked `paid` automatically
- No Paystack API calls are made

---

## 10. Testing Checklist

### Before going live

- [ ] Set `PAYSTACK_SECRET_KEY` to live key
- [ ] Set `PAYSTACK_TEST_MODE=false`
- [ ] Set `NEXT_PUBLIC_BASE_URL` to production domain
- [ ] Configure webhook URL in Paystack dashboard
- [ ] Test with Paystack test card: `4084 0840 8408 4081`, CVV `408`, Expiry `01/99`
- [ ] Test with MTN MoMo test: use `0551234987` as the number
- [ ] Test failed payment (use card `4084 0840 8408 4081` with wrong CVV)
- [ ] Test abandoned payment (close Paystack popup without paying)
- [ ] Test returning user (complete one order, then go back to checkout)
- [ ] Test on mobile (Android Chrome + iOS Safari)
- [ ] Verify webhook receives events (check Paystack dashboard → Logs)
- [ ] Verify orders appear in admin dashboard after payment

### Paystack test cards (Ghana)
| Card | Result |
|------|--------|
| `4084 0840 8408 4081` | Success |
| `4084 0840 8408 4081` (wrong CVV) | Failed |
| Any Visa/Mastercard with `408` CVV | Success |

### Paystack test mobile money
| Number | Network | Result |
|--------|---------|--------|
| `0551234987` | MTN | Success |
| `0201234987` | Vodafone | Success |

---

## Architecture Summary

```
Browser (localStorage)
  └── exa-customer-profile: { phone, address, notes }
        ↓ auto-fill on next visit

CheckoutForm (client)
  └── 2 fields: phone + address
  └── Normalises phone to +233XXXXXXXXX
  └── Calls createOrderWithPayment (server action)

createOrderWithPayment (server)
  ├── Validates with Zod
  ├── Generates reference: EXA-<ts>-<rnd>
  ├── Derives email: <digits>@orders.exaanesvad.com
  ├── Creates Order in PostgreSQL (status: pending)
  ├── Fires admin notification (non-blocking)
  └── Calls Paystack API → returns authorization_url

Paystack (external)
  └── User pays via card or mobile money
  └── Redirects to /checkout/confirmation?ref=...
  └── POSTs to /api/webhooks/paystack (authoritative)

ConfirmationClient (client)
  ├── Calls verifyPayment(ref) → Paystack API
  ├── Success: shows order summary + delivery address + "what's next"
  └── Failed: shows error + retry button

Webhook (/api/webhooks/paystack)
  ├── Verifies HMAC-SHA512 signature
  ├── charge.success → marks order paid (idempotent)
  └── charge.failed  → marks order failed
```
