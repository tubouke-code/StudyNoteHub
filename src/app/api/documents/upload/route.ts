import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import fs from 'fs';
import path from 'path';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const title = (formData.get('title') as string) || '';
    const courseCode = (formData.get('course_code') as string) || '';
    const courseTitle = (formData.get('course_title') as string) || title;
    const institution = (formData.get('institution') as string) || '';
    const description = (formData.get('description') as string) || '';
    const price = Number(formData.get('price')) || 0;
    const uploaderId = (formData.get('uploader_id') as string) || '';
    const uploaderEmail = (formData.get('uploader_email') as string) || '';
    const uploaderName = (formData.get('uploader_name') as string) || '';
    const faculty = (formData.get('faculty') as string) || '';
    const department = (formData.get('department') as string) || '';
    const level = (formData.get('level') as string) || '';

    if (!title || !courseCode || !institution) {
      return NextResponse.json({ error: 'Missing required title, course code or institution' }, { status: 400 });
    }

    const supabase = createAdminClient();

    // 1. Ensure uploader profile exists in profiles table
    if (uploaderId) {
      await supabase.from('profiles').upsert({
        id: uploaderId,
        email: uploaderEmail || 'writer@studynotehub.com',
        full_name: uploaderName || 'Academic Contributor',
        role: 'WRITER',
        is_email_verified: true,
      }, { onConflict: 'id' });
    }

    let filePath = '';
    let fileExt = 'pdf';
    let fileSize = 2048000;
    let originalName = '';

    // 2. Process and save uploaded binary file (PDF, DOCX, DOC, PPTX, TXT, etc.)
    if (file && typeof file.arrayBuffer === 'function') {
      originalName = file.name;
      fileExt = file.name.split('.').pop()?.toLowerCase() || 'pdf';
      fileSize = file.size;
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // Create uploads directory in public/uploads/documents
      const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'documents');
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      const safeBaseName = originalName.replace(/[^a-zA-Z0-9._-]/g, '_');
      const uniqueFileName = `${Date.now()}_${Math.random().toString(36).substring(2, 7)}_${safeBaseName}`;
      const destinationPath = path.join(uploadDir, uniqueFileName);

      fs.writeFileSync(destinationPath, buffer);
      filePath = `/uploads/documents/${uniqueFileName}`;

      // Optional: also attempt to upload to Supabase storage if bucket exists
      try {
        await supabase.storage.from('documents').upload(uniqueFileName, buffer, {
          contentType: file.type || 'application/octet-stream',
          upsert: true,
        });
      } catch (storageErr) {
        console.warn('Supabase storage bucket upload notice (saved to local store):', storageErr);
      }
    } else {
      filePath = `/uploads/documents/sample_${Date.now()}.${fileExt}`;
    }

    // 3. Insert document record into Supabase
    const basePayload: Record<string, any> = {
      uploader_id: uploaderId,
      title: title.trim(),
      course_code: courseCode.trim().toUpperCase(),
      course_title: courseTitle.trim() || title.trim(),
      institution: institution.trim(),
      description: description.trim(),
      price,
      file_path: filePath,
      file_type: fileExt,
      status: 'PENDING',
      file_size_bytes: fileSize,
    };

    let insertedDoc = null;
    let insertErr = null;

    // Full insert with optional columns
    const { data: d1, error: e1 } = await supabase.from('documents').insert({
      ...basePayload,
      faculty,
      department,
      level,
      downloads_count: 0,
    }).select().single();

    if (d1) {
      insertedDoc = d1;
    } else {
      insertErr = e1;
      // Core insert fallback
      const { data: d2, error: e2 } = await supabase.from('documents').insert(basePayload).select().single();
      if (d2) {
        insertedDoc = d2;
      } else {
        insertErr = e2 || e1;
      }
    }

    if (!insertedDoc) {
      console.error('Document insert failure:', insertErr);
      return NextResponse.json({ error: insertErr?.message || 'Failed to save document record' }, { status: 400 });
    }

    return NextResponse.json({ success: true, document: insertedDoc });
  } catch (err: any) {
    console.error('API upload error:', err);
    return NextResponse.json({ error: err.message || 'Server error during upload' }, { status: 500 });
  }
}
