import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { addClaimDocument } from '@/services/claim.service';
import { put } from '@vercel/blob';

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

    // Upload to Vercel Blob
    const blob = await put(`claims/${claimId}/${file.name}`, file, {
      access: 'public',
    });

    // Save metadata in database
    const document = await addClaimDocument(claimId, file.name, blob.url);

    return NextResponse.json({ success: true, document });
  } catch (error) {
    console.error('File upload error:', error);
    return NextResponse.json({ error: (error as Error).message ?? 'File upload failed' }, { status: 500 });
  }
}
