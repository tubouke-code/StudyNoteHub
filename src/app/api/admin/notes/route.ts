import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = createAdminClient();

    // Fetch notes fast using raw select
    const { data: notes, error } = await supabase
      .from('documents')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching admin notes:', error);
      return NextResponse.json({ success: false, error: error.message, notes: [] });
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
    const { documentId, action } = body; // action: 'APPROVE' | 'REJECT' | 'PENDING'

    if (!documentId || !action) {
      return NextResponse.json({ error: 'Missing documentId or action' }, { status: 400 });
    }

    const supabase = createAdminClient();
    const newStatus = action === 'APPROVE' ? 'APPROVED' : action === 'REJECT' ? 'REJECTED' : 'PENDING';

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

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const documentId = searchParams.get('id');

    if (!documentId) {
      return NextResponse.json({ error: 'Missing document ID for deletion' }, { status: 400 });
    }

    const supabase = createAdminClient();

    // 1. Delete dependent purchase records first (foreign key integrity)
    try {
      await supabase
        .from('document_purchases')
        .delete()
        .eq('document_id', documentId);
    } catch (depErr) {
      console.warn('Purchase dependency note:', depErr);
    }

    // 2. Permanently delete document from documents table
    const { error: deleteErr } = await supabase
      .from('documents')
      .delete()
      .eq('id', documentId);

    if (deleteErr) {
      console.error('Database permanent delete error:', deleteErr);
      return NextResponse.json({ error: deleteErr.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: 'Document permanently deleted from database.' });
  } catch (err: any) {
    console.error('Admin delete server error:', err);
    return NextResponse.json({ error: err.message || 'Server deletion error' }, { status: 500 });
  }
}
