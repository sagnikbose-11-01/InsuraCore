import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { updateAssessorProfile } from '@/services/user.service';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create a unique filename
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const originalExt = path.extname(file.name);
    const sanitizedBase = path.basename(file.name, originalExt).replace(/[^a-zA-Z0-9]/g, '_');
    const filename = `avatar-${session.id}-${uniqueSuffix}${originalExt}`;

    // Define upload path inside workspace public directory
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    
    // Ensure upload directory exists
    await mkdir(uploadDir, { recursive: true });

    const filePath = path.join(uploadDir, filename);
    await writeFile(filePath, buffer);

    // Document URL exposed by Next.js static serving
    const avatarUrl = `/uploads/${filename}`;

    // Update avatar path in user document
    await updateAssessorProfile(session.id, { avatar: avatarUrl });

    return NextResponse.json({ success: true, avatarUrl });
  } catch (error) {
    console.error('Avatar upload error:', error);
    return NextResponse.json({ error: (error as Error).message ?? 'Avatar upload failed' }, { status: 500 });
  }
}
