import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ error: 'Supabase credentials missing' }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false },
    });

    // Execute all queries in PARALLEL for maximum speed (< 200ms)
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
      // 1. Fetch all documents with uploader details
      supabase
        .from('documents')
        .select('*, uploader:profiles(*)')
        .order('created_at', { ascending: false }),

      // 2. Fetch writer profiles
      supabase
        .from('profiles')
        .select('*')
        .or('role.eq.WRITER,is_verified_writer.eq.true')
        .order('created_at', { ascending: false }),

      // 3. Fetch disputed orders
      supabase
        .from('orders')
        .select('*, client:profiles!orders_client_id_fkey(*), writer:profiles!orders_writer_id_fkey(*)')
        .eq('status', 'DISPUTED')
        .order('created_at', { ascending: false }),

      // 4. Fetch admin team
      supabase
        .from('profiles')
        .select('*')
        .eq('role', 'ADMIN')
        .order('created_at', { ascending: false }),

      // 5. Fetch payout requests
      supabase
        .from('payout_requests')
        .select('*, writer:profiles(*)')
        .order('created_at', { ascending: false }),

      // 6. Profiles summary
      supabase
        .from('profiles')
        .select('id, role, institution, created_at, full_name, email'),

      // 7. Orders summary
      supabase
        .from('orders')
        .select('id, status, budget, escrow_status, service_type, created_at'),

      // 8. Transactions
      supabase
        .from('transactions')
        .select('id, type, amount, description, created_at, reference')
        .order('created_at', { ascending: false })
    ]);

    // Handle documents with fallback if join failed
    let notes: any[] = [];
    if (notesRes.status === 'fulfilled' && !notesRes.value.error && notesRes.value.data) {
      notes = notesRes.value.data;
    } else {
      // Direct raw documents fetch fallback
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
