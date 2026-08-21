import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const supabase = createAdminClient();

    const userId = body.client_id || body.student_id;
    if (!userId) {
      return NextResponse.json({ error: 'Missing user ID' }, { status: 400 });
    }

    // 1. Ensure user profile exists to satisfy foreign key
    await supabase.from('profiles').upsert({
      id: userId,
      email: body.client_email || 'student@studynotehub.com',
      full_name: body.client_name || 'University Student',
      role: 'STUDENT',
      is_email_verified: true,
    }, { onConflict: 'id' });

    const totalBudget = Number(body.budget) || 25000;
    const writerCut = Math.round(totalBudget * 0.85);
    const platformCommission = totalBudget - writerCut;
    const titleVal = body.title?.trim() || 'Academic Research Project';
    const topicVal = body.topic?.trim() || titleVal;

    // 2. Build full payload satisfying schema constraints
    const fullPayload: Record<string, any> = {
      client_id: userId,
      student_id: userId,
      writer_id: body.writer_id || null,
      title: titleVal,
      topic: topicVal,
      service_type: body.service_type || 'Project Writing',
      subject_area: body.subject_area || 'General Academic',
      academic_level: body.academic_level || 'Undergraduate',
      instructions: body.instructions || 'Standard research guidelines.',
      budget: totalBudget,
      writer_cut: writerCut,
      platform_commission: platformCommission,
      escrow_amount: 0.00,
      page_count: Number(body.pages_count) || 1,
      pages_count: Number(body.pages_count) || 1,
      word_count: Number(body.word_count) || 12000,
      citation_style: body.citation_style || 'APA 7th',
      deadline: body.deadline || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'OPEN',
      escrow_status: 'UNPAID',
      turnitin_required: true,
    };

    // Attempt insert
    let newOrder = null;
    let lastError = null;

    const { data: d1, error: e1 } = await supabase.from('orders').insert(fullPayload).select().single();
    if (d1) {
      newOrder = d1;
    } else {
      lastError = e1;
      console.warn('First order insert attempt failed:', e1);

      // Attempt 2: Core payload with client_id
      const corePayload = {
        title: titleVal,
        academic_level: body.academic_level || 'Undergraduate',
        service_type: body.service_type || 'Project Writing',
        subject_area: body.subject_area || 'General Academic',
        instructions: body.instructions || 'Standard research guidelines.',
        budget: totalBudget,
        deadline: body.deadline || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        citation_style: body.citation_style || 'APA 7th',
        status: 'OPEN',
        escrow_status: 'UNPAID',
      };

      const { data: d2, error: e2 } = await supabase.from('orders').insert({
        ...corePayload,
        client_id: userId,
        topic: topicVal,
        writer_cut: writerCut,
        platform_commission: platformCommission,
      }).select().single();

      if (d2) {
        newOrder = d2;
      } else {
        // Try with student_id
        const { data: d3, error: e3 } = await supabase.from('orders').insert({
          ...corePayload,
          student_id: userId,
        }).select().single();

        if (d3) {
          newOrder = d3;
        } else {
          lastError = e3 || e2 || e1;
        }
      }
    }

    if (!newOrder) {
      console.error('All order insert attempts failed:', lastError);
      return NextResponse.json({ error: lastError?.message || 'Failed to create order in database' }, { status: 400 });
    }

    return NextResponse.json({ success: true, order: newOrder });
  } catch (err: any) {
    console.error('Order creation exception:', err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
