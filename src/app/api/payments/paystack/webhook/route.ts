import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { createServerComponentClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get('x-paystack-signature');
    const secretKey = process.env.PAYSTACK_SECRET_KEY || 'sk_test_mock_secret_key';

    // Verify HMAC-SHA512 Webhook Signature
    const hash = crypto
      .createHmac('sha512', secretKey)
      .update(rawBody)
      .digest('hex');

    if (signature && signature !== hash) {
      console.error('Invalid Paystack Webhook Signature');
      return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 401 });
    }

    const payload = JSON.parse(rawBody);
    const event = payload.event;
    const data = payload.data;

    // Handle Successful Charge Event
    if (event === 'charge.success') {
      const reference = data.reference;
      const amountPaid = data.amount / 100; // Convert kobo to NGN
      const metadata = data.metadata || {};
      const userId = metadata.user_id;
      const itemType = metadata.item_type;

      const supabase = createServerComponentClient();

      if (itemType === 'ESCROW_FUNDING') {
        // Update order status to IN_PROGRESS and escrow_status to HELD_IN_ESCROW
        if (metadata.order_id) {
          await supabase
            .from('orders')
            .update({
              status: 'IN_PROGRESS',
              escrow_status: 'HELD_IN_ESCROW',
            })
            .eq('id', metadata.order_id);
        }
      } else if (itemType === 'WALLET_TOPUP' && userId) {
        // Credit user wallet
        await supabase.rpc('increment_wallet_balance', {
          user_uuid: userId,
          amount_to_add: amountPaid,
        });
      }

      // Record immutable ledger entry
      await supabase.from('transactions').insert({
        user_id: userId,
        amount: amountPaid,
        fee: 0,
        type: itemType === 'WALLET_TOPUP' ? 'WALLET_DEPOSIT' : 'ESCROW_LOCK',
        gateway: 'PAYSTACK',
        reference: reference,
        description: `Verified Paystack Webhook payment for reference ${reference}`,
      });
    }

    return NextResponse.json({ status: 'success', received: true });
  } catch (err: any) {
    console.error('Paystack Webhook Processing Error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
