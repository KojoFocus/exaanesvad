const PAYSTACK_BASE_URL = 'https://api.paystack.co';

// ─── Types ────────────────────────────────────────────────────────────────────

export type PaystackChannel = 'card' | 'bank' | 'ussd' | 'qr' | 'mobile_money' | 'bank_transfer';

export interface PaystackCustomField {
  display_name:  string;
  variable_name: string;
  value:         string;
}

/**
 * Paystack metadata object.
 * `custom_fields` appear on the Paystack dashboard transaction detail.
 * Additional top-level keys are stored as-is and returned on verification.
 */
export interface PaystackMetadata {
  custom_fields?:    PaystackCustomField[];
  order_id?:         string;
  customer_phone?:   string;
  delivery_address?: string;
  [key: string]:     unknown;
}

export interface InitializePaymentData {
  email:        string;
  amount:       number;          // in GHS — converted to pesewas (×100) internally
  currency?:    string;
  reference:    string;
  callbackUrl:  string;
  channels?:    PaystackChannel[];
  metadata?:    PaystackMetadata;
}

export interface PaystackResponse<T> {
  status:  boolean;
  message: string;
  data:    T;
}

export interface InitializePaymentResponse {
  authorization_url: string;
  access_code:       string;
  reference:         string;
}

export interface VerifyTransactionResponse {
  id:         number;
  domain:     string;
  status:     'success' | 'failed' | 'abandoned';
  reference:  string;
  amount:     number;   // in pesewas
  currency:   string;
  channel:    string;
  paidAt:     string;
  createdAt:  string;
  metadata:   PaystackMetadata;
}

// ─── initializePayment ────────────────────────────────────────────────────────

export async function initializePayment(
  data: InitializePaymentData
): Promise<{ success: boolean; authorizationUrl?: string; error?: string }> {
  const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;
  if (!PAYSTACK_SECRET_KEY) {
    console.error('Paystack secret key not configured');
    return { success: false, error: 'Payment system not configured' };
  }

  if (!data.email || !data.amount || !data.reference || !data.callbackUrl) {
    return { success: false, error: 'Missing required payment data' };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(data.email)) {
    return { success: false, error: 'Invalid email format' };
  }

  if (data.amount <= 0) {
    return { success: false, error: 'Invalid payment amount' };
  }

  try {
    const body: Record<string, unknown> = {
      email:        data.email,
      amount:       Math.round(data.amount * 100),   // GHS → pesewas
      currency:     data.currency || 'GHS',
      reference:    data.reference,
      callback_url: data.callbackUrl,
    };

    // Only include channels if explicitly provided
    if (data.channels && data.channels.length > 0) {
      body.channels = data.channels;
    }

    if (data.metadata) {
      body.metadata = data.metadata;
    }

    const response = await fetch(`${PAYSTACK_BASE_URL}/transaction/initialize`, {
      method:  'POST',
      headers: {
        Authorization:  `Bearer ${PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json',
        'User-Agent':   'EXA-ANESVAD/1.0',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Paystack API error:', response.status, errorText);
      return { success: false, error: `Payment service unavailable (${response.status})` };
    }

    const result: PaystackResponse<InitializePaymentResponse> = await response.json();

    if (result.status && result.data.authorization_url) {
      return { success: true, authorizationUrl: result.data.authorization_url };
    }

    return { success: false, error: result.message || 'Failed to initialize payment' };
  } catch (error) {
    console.error('Paystack initialize error:', error);
    return { success: false, error: 'Payment initialization failed' };
  }
}

// ─── verifyTransaction ────────────────────────────────────────────────────────

export async function verifyTransaction(
  reference: string
): Promise<{ success: boolean; data?: VerifyTransactionResponse; error?: string }> {
  const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;
  if (!PAYSTACK_SECRET_KEY) {
    console.error('Paystack secret key not configured');
    return { success: false, error: 'Payment system not configured' };
  }

  if (!reference || typeof reference !== 'string') {
    return { success: false, error: 'Invalid transaction reference' };
  }

  try {
    const response = await fetch(
      `${PAYSTACK_BASE_URL}/transaction/verify/${encodeURIComponent(reference)}`,
      {
        headers: {
          Authorization:  `Bearer ${PAYSTACK_SECRET_KEY}`,
          'Content-Type': 'application/json',
          'User-Agent':   'EXA-ANESVAD/1.0',
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Paystack verification API error:', response.status, errorText);
      return { success: false, error: `Payment verification service unavailable (${response.status})` };
    }

    const result: PaystackResponse<VerifyTransactionResponse> = await response.json();

    if (result.status) {
      return { success: true, data: result.data };
    }

    return { success: false, error: result.message || 'Transaction verification failed' };
  } catch (error) {
    console.error('Paystack verify error:', error);
    return { success: false, error: 'Transaction verification failed' };
  }
}
