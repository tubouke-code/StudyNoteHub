import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ error: 'Missing Supabase credentials' }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false },
    });

    // 1. Ensure profile exists
    if (body.uploader_id) {
      await supabase.from('profiles').upsert({
        id: body.uploader_id,
        email: body.uploader_email || 'user@studynotehub.com',
        full_name: body.uploader_name || 'Academic Scholar',
        role: 'STUDENT',
        is_email_verified: true,
      }, { onConflict: 'id' });
    }

    // 2. Insert document
    const { data, error } = await supabase.from('documents').insert({
      uploader_id: body.uploader_id,
      title: body.title,
      course_code: body.course_code,
      course_title: body.course_title,
      institution: body.institution,
      description: body.description,
      price: body.price,
      file_path: body.file_path,
      file_type: body.file_type || 'pdf',
      status: 'PENDING',
      faculty: body.faculty,
      department: body.department,
      level: body.level,
      file_size_bytes: body.file_size_bytes || 2048000,
    }).select().single();

    if (error) {
      console.error('API Document insert error:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, document: data });
  } catch (err: any) {
    console.error('Server upload error:', err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
