import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { addClaimDocument } from '@/services/claim.service';
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
    const claimId = formData.get('claimId') as string | null;

    if (!file || !claimId) {
      return NextResponse.json({ error: 'File and claimId are required' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create a unique filename
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const originalExt = path.extname(file.name);
    const sanitizedBase = path.basename(file.name, originalExt).replace(/[^a-zA-Z0-9]/g, '_');
    const filename = `${sanitizedBase}-${uniqueSuffix}${originalExt}`;

    // Define upload path inside workspace public directory
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    
    // Ensure upload directory exists
    await mkdir(uploadDir, { recursive: true });

    const filePath = path.join(uploadDir, filename);
    await writeFile(filePath, buffer);

    // Document URL exposed by Next.js static serving
    const documentUrl = `/uploads/${filename}`;

    // Save metadata in database
    const document = await addClaimDocument(claimId, file.name, documentUrl);

    return NextResponse.json({ success: true, document });
  } catch (error) {
    console.error('File upload error:', error);
    return NextResponse.json({ error: (error as Error).message ?? 'File upload failed' }, { status: 500 });
  }
}
