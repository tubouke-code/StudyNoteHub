import { NextResponse } from 'next/server';
import { verifyPaystackPayment } from '@/lib/paystack';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const reference = searchParams.get('reference') || searchParams.get('trxref');
    const isMock = searchParams.get('mock') === 'true';

    if (!reference) {
      return NextResponse.json({ status: false, message: 'Reference is required' }, { status: 400 });
    }

    const verification = await verifyPaystackPayment(reference);

    if (isMock) {
      // In development / mock mode, redirect back to application with success state
      return NextResponse.redirect(new URL('/dashboard?payment=success', req.url));
    }

    return NextResponse.json(verification);
  } catch (error: any) {
    return NextResponse.json(
      { status: false, message: error.message || 'Payment verification failed' },
      { status: 500 }
    );
  }
}
