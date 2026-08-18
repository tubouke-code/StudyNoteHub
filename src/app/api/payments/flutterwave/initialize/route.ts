import { NextResponse } from 'next/server';
import { initializeFlutterwavePayment } from '@/lib/flutterwave';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { amount, email, name, itemType, itemId } = body;

    if (!amount || !email) {
      return NextResponse.json(
        { status: 'error', message: 'Amount and email are required.' },
        { status: 400 }
      );
    }

    const response = await initializeFlutterwavePayment({
      amount,
      customer: {
        email,
        name: name || 'Student User',
      },
      meta: {
        itemType,
        itemId,
      },
    });

    return NextResponse.json(response);
  } catch (error: any) {
    return NextResponse.json(
      { status: 'error', message: error.message || 'Flutterwave payment initialization failed' },
      { status: 500 }
    );
  }
}
