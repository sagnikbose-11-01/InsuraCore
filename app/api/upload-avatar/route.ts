import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { updateAssessorProfile } from '@/services/user.service';
import { put } from '@vercel/blob';

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

    // Upload to Vercel Blob
    const blob = await put(`avatars/${session.id}/${file.name}`, file, {
      access: 'public',
    });

    // Update avatar path in user document
    await updateAssessorProfile(session.id, { avatar: blob.url });

    return NextResponse.json({ success: true, avatarUrl: blob.url });
  } catch (error) {
    console.error('Avatar upload error:', error);
    return NextResponse.json({ error: (error as Error).message ?? 'Avatar upload failed' }, { status: 500 });
  }
}
