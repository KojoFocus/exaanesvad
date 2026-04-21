import { env } from 'process';

const PAYSTACK_SECRET_KEY = env.PAYSTACK_SECRET_KEY;
const PAYSTACK_BASE_URL = 'https://api.paystack.co';

// Validate that secret key is configured
if (!PAYSTACK_SECRET_KEY) {
  console.warn('⚠️  PAYSTACK_SECRET_KEY is not configured. Payment functionality will be disabled.');
}

export interface InitializePaymentData {
  email: string;
  amount: number; // in kobo (GHS * 100)
  currency?: string;
  reference: string;
  callbackUrl: string;
  metadata?: {
    custom_fields: Array<{
      display_name: string;
      variable_name: string;
      value: string;
    }>;
  };
}

export interface PaystackResponse<T> {
  status: boolean;
  message: string;
  data: T;
}

export interface InitializePaymentResponse {
  authorization_url: string;
  access_code: string;
  reference: string;
}

export interface VerifyTransactionResponse {
  id: number;
  domain: string;
  status: 'success' | 'failed' | 'abandoned';
  reference: string;
  amount: number;
  currency: string;
  channel: string;
  paidAt: string;
  createdAt: string;
  metadata: any;
}

export async function initializePayment(data: InitializePaymentData): Promise<{ success: boolean; authorizationUrl?: string; error?: string }> {
  if (!PAYSTACK_SECRET_KEY) {
    console.error('Paystack secret key not configured');
    return { success: false, error: 'Payment system not configured' };
  }

  // Validate input data
  if (!data.email || !data.amount || !data.reference || !data.callbackUrl) {
    return { success: false, error: 'Missing required payment data' };
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(data.email)) {
    return { success: false, error: 'Invalid email format' };
  }

  // Validate amount is positive
  if (data.amount <= 0) {
    return { success: false, error: 'Invalid payment amount' };
  }

  try {
    const response = await fetch(`${PAYSTACK_BASE_URL}/transaction/initialize`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json',
        'User-Agent': 'EXA-ANESVAD/1.0',
      },
      body: JSON.stringify({
        email: data.email,
        amount: Math.round(data.amount * 100), // Convert to kobo
        currency: data.currency || 'GHS',
        reference: data.reference,
        callback_url: data.callbackUrl,
        metadata: data.metadata,
      }),
    });

    // Check for HTTP errors
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

export async function verifyTransaction(reference: string): Promise<{ success: boolean; data?: VerifyTransactionResponse; error?: string }> {
  if (!PAYSTACK_SECRET_KEY) {
    console.error('Paystack secret key not configured');
    return { success: false, error: 'Payment system not configured' };
  }

  // Validate reference format
  if (!reference || typeof reference !== 'string') {
    return { success: false, error: 'Invalid transaction reference' };
  }

  try {
    const response = await fetch(`${PAYSTACK_BASE_URL}/transaction/verify/${encodeURIComponent(reference)}`, {
      headers: {
        'Authorization': `Bearer ${PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json',
        'User-Agent': 'EXA-ANESVAD/1.0',
      },
    });

    // Check for HTTP errors
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
