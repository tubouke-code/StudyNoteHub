export interface PaystackInitParams {
  email: string;
  amount: number; // in Naira (will be converted to Kobo for Paystack)
  reference?: string;
  callback_url?: string;
  metadata?: Record<string, any>;
  currency?: string;
}

export interface PaystackInitResponse {
  status: boolean;
  message: string;
  data: {
    authorization_url: string;
    access_code: string;
    reference: string;
  };
}

export interface PaystackVerifyResponse {
  status: boolean;
  message: string;
  data: {
    id: number;
    domain: string;
    status: 'success' | 'failed' | 'abandoned';
    reference: string;
    amount: number; // In kobo
    gateway_response: string;
    paid_at: string;
    channel: string;
    currency: string;
    customer: {
      id: number;
      email: string;
      customer_code: string;
    };
    metadata?: Record<string, any>;
  };
}

export async function initializePaystackPayment(params: PaystackInitParams): Promise<PaystackInitResponse> {
  const secretKey = process.env.PAYSTACK_SECRET_KEY;
  const reference = params.reference || `SNH_PSTK_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

  // If secret key is not set or placeholder, return a simulated mock transaction URL for development preview
  if (!secretKey || secretKey.includes('sample') || secretKey.includes('xxxx')) {
    return {
      status: true,
      message: 'Authorization URL created (Mock Mode)',
      data: {
        authorization_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/payments/paystack/verify?reference=${reference}&mock=true`,
        access_code: `mock_acc_${Date.now()}`,
        reference: reference,
      },
    };
  }

  const response = await fetch('https://api.paystack.co/transaction/initialize', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${secretKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: params.email,
      amount: Math.round(params.amount * 100), // convert to kobo
      reference: reference,
      callback_url: params.callback_url || `${process.env.NEXT_PUBLIC_APP_URL}/api/payments/paystack/verify`,
      metadata: params.metadata,
      currency: params.currency || 'NGN',
    }),
  });

  return response.json();
}

export async function verifyPaystackPayment(reference: string): Promise<PaystackVerifyResponse> {
  const secretKey = process.env.PAYSTACK_SECRET_KEY;

  // Mock verification fallback
  if (!secretKey || secretKey.includes('sample') || secretKey.includes('xxxx') || reference.startsWith('SNH_PSTK_')) {
    return {
      status: true,
      message: 'Verification successful (Simulated)',
      data: {
        id: 999999,
        domain: 'test',
        status: 'success',
        reference: reference,
        amount: 500000, // 5000 NGN in kobo
        gateway_response: 'Successful',
        paid_at: new Date().toISOString(),
        channel: 'card',
        currency: 'NGN',
        customer: {
          id: 1001,
          email: 'student@example.com',
          customer_code: 'CUS_mock',
        },
        metadata: {},
      },
    };
  }

  const response = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${secretKey}`,
    },
  });

  return response.json();
}
