import { NextResponse } from 'next/server';
import { createServerComponentClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  try {
    const signature = request.headers.get('verif-hash');
    const secretHash = process.env.FLUTTERWAVE_SECRET_HASH || 'snh_flutterwave_secret_hash';

    // Verify Flutterwave Signature Hash
    if (signature && signature !== secretHash) {
      console.error('Invalid Flutterwave Webhook Hash');
      return NextResponse.json({ error: 'Invalid webhook hash' }, { status: 401 });
    }

    const payload = await request.json();
    const event = payload.event;
    const data = payload.data;

    if (data && data.status === 'successful') {
      const txRef = data.tx_ref;
      const amountPaid = data.amount;
      const meta = data.meta || {};
      const userId = meta.user_id;

      const supabase = createServerComponentClient();

      // Record immutable ledger entry
      await supabase.from('transactions').insert({
        user_id: userId,
        amount: amountPaid,
        fee: 0,
        type: meta.item_type === 'WALLET_TOPUP' ? 'WALLET_DEPOSIT' : 'ESCROW_LOCK',
        gateway: 'FLUTTERWAVE',
        reference: txRef,
        description: `Verified Flutterwave Webhook payment for reference ${txRef}`,
      });
    }

    return NextResponse.json({ status: 'success', received: true });
  } catch (err: any) {
    console.error('Flutterwave Webhook Error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
