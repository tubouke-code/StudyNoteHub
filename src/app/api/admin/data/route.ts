import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabase = createAdminClient();

    // Execute all queries in parallel
    const [
      notesRes,
      writersRes,
      disputesRes,
      teamRes,
      payoutsRes,
      allProfilesRes,
      allOrdersRes,
      allTxnsRes
    ] = await Promise.allSettled([
      // 1. All documents
      supabase
        .from('documents')
        .select('*, uploader:profiles(*)')
        .order('created_at', { ascending: false }),

      // 2. Writer profiles
      supabase
        .from('profiles')
        .select('*')
        .or('role.eq.WRITER,is_verified_writer.eq.true')
        .order('created_at', { ascending: false }),

      // 3. Disputed orders
      supabase
        .from('orders')
        .select('*')
        .eq('status', 'DISPUTED')
        .order('created_at', { ascending: false }),

      // 4. Admin team
      supabase
        .from('profiles')
        .select('*')
        .eq('role', 'ADMIN')
        .order('created_at', { ascending: false }),

      // 5. Payout requests
      supabase
        .from('payout_requests')
        .select('*, writer:profiles(*)')
        .order('created_at', { ascending: false }),

      // 6. All profiles
      supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false }),

      // 7. All orders
      supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false }),

      // 8. All transactions
      supabase
        .from('transactions')
        .select('*')
        .order('created_at', { ascending: false })
    ]);

    // Handle documents with resilient fallback
    let notes: any[] = [];
    if (notesRes.status === 'fulfilled' && !notesRes.value.error && notesRes.value.data) {
      notes = notesRes.value.data;
    } else {
      const { data: rawDocs } = await supabase
        .from('documents')
        .select('*')
        .order('created_at', { ascending: false });
      notes = rawDocs || [];
    }

    const writers = (writersRes.status === 'fulfilled' && writersRes.value.data) || [];
    const disputes = (disputesRes.status === 'fulfilled' && disputesRes.value.data) || [];
    const team = (teamRes.status === 'fulfilled' && teamRes.value.data) || [];
    const payouts = (payoutsRes.status === 'fulfilled' && payoutsRes.value.data) || [];
    const allProfiles = (allProfilesRes.status === 'fulfilled' && allProfilesRes.value.data) || [];
    const allOrders = (allOrdersRes.status === 'fulfilled' && allOrdersRes.value.data) || [];
    const allTxns = (allTxnsRes.status === 'fulfilled' && allTxnsRes.value.data) || [];

    return NextResponse.json({
      success: true,
      notes,
      writers,
      disputes,
      team,
      payouts,
      allProfiles,
      allOrders,
      allTxns,
    });
  } catch (err: any) {
    console.error('Admin fast data fetch API error:', err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
