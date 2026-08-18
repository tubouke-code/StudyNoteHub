import { NextResponse } from 'next/server';
import { initializePaystackPayment } from '@/lib/paystack';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { amount, email, itemType, itemId } = body;

    if (!amount || !email) {
      return NextResponse.json(
        { status: false, message: 'Amount and email are required.' },
        { status: 400 }
      );
    }

    const response = await initializePaystackPayment({
      email,
      amount,
      metadata: {
        itemType,
        itemId,
      },
    });

    return NextResponse.json(response);
  } catch (error: any) {
    return NextResponse.json(
      { status: false, message: error.message || 'Payment initialization failed' },
      { status: 500 }
    );
  }
}
