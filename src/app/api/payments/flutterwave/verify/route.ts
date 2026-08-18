import { NextResponse } from 'next/server';
import { verifyFlutterwavePayment } from '@/lib/flutterwave';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const transactionId = searchParams.get('transaction_id') || searchParams.get('tx_ref');
    const isMock = searchParams.get('mock') === 'true';

    if (!transactionId) {
      return NextResponse.json({ status: 'error', message: 'Transaction identifier is required' }, { status: 400 });
    }

    const verification = await verifyFlutterwavePayment(transactionId);

    if (isMock) {
      return NextResponse.redirect(new URL('/dashboard?payment=success', req.url));
    }

    return NextResponse.json(verification);
  } catch (error: any) {
    return NextResponse.json(
      { status: 'error', message: error.message || 'Verification failed' },
      { status: 500 }
    );
  }
}
