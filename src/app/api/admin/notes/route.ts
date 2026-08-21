import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false },
    });

    // 1. Fetch all pending notes for moderation
    const { data: notes, error } = await supabase
      .from('documents')
      .select('*, uploader:profiles(*)')
      .eq('status', 'PENDING')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('API fetch with join failed, retrying raw:', error);
      const { data: rawNotes } = await supabase
        .from('documents')
        .select('*')
        .eq('status', 'PENDING')
        .order('created_at', { ascending: false });
      return NextResponse.json({ success: true, notes: rawNotes || [] });
    }

    return NextResponse.json({ success: true, notes: notes || [] });
  } catch (err: any) {
    console.error('Admin notes API error:', err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { documentId, action } = body; // action: 'APPROVE' | 'REJECT'

    if (!documentId || !action) {
      return NextResponse.json({ error: 'Missing documentId or action' }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false },
    });

    const newStatus = action === 'APPROVE' ? 'APPROVED' : 'REJECTED';

    const { data, error } = await supabase
      .from('documents')
      .update({ status: newStatus })
      .eq('id', documentId)
      .select()
      .single();

    if (error) {
      console.error('Error updating document status:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, document: data, status: newStatus });
  } catch (err: any) {
    console.error('Admin note update error:', err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
