// ============================================================
// app/assessor/profile/page.tsx
// Server component loading assessor profile credentials and metrics.
// ============================================================

import React from 'react';
import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { getSession } from '@/lib/auth/session';
import { getUserById } from '@/services/user.service';
import { getAssessorProfileData } from '@/services/assessor.service';
import { AssessorProfileConsole } from '@/components/assessor/AssessorProfileConsole';
import { User } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Profile | Assessor Workspace',
};

export default async function ProfilePage() {
  const session = await getSession();
  if (!session) redirect('/auth/login');

  // Load User details and metrics from MongoDB
  const user = await getUserById(session.id);
  if (!user) redirect('/auth/login');

  const profileData = await getAssessorProfileData(session.id);

  // Parse User Agent from headers
  const headerList = await headers();
  const userAgent = headerList.get('user-agent') || '';

  let browser = 'Unknown Browser';
  let device = 'Desktop';

  if (userAgent.includes('Firefox')) {
    browser = 'Mozilla Firefox';
  } else if (userAgent.includes('Chrome')) {
    browser = 'Google Chrome';
  } else if (userAgent.includes('Safari')) {
    browser = 'Apple Safari';
  } else if (userAgent.includes('Edge')) {
    browser = 'Microsoft Edge';
  }

  if (userAgent.includes('Mobile') || userAgent.includes('Android') || userAgent.includes('iPhone')) {
    device = 'Mobile Device';
  } else if (userAgent.includes('Tablet') || userAgent.includes('iPad')) {
    device = 'Tablet Device';
  }

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[rgba(255,255,255,0.06)] pb-5">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <User className="w-6 h-6 text-purple-400" /> Assessor Profile
          </h1>
          <p className="text-sm text-[var(--color-base-400)] mt-1">
            Manage your credentials, professional biography, and analyze specialization settlement analytics.
          </p>
        </div>
      </div>

      {/* Profile Console Component */}
      <AssessorProfileConsole 
        user={user} 
        profileData={profileData} 
        browser={browser} 
        device={device} 
      />
    </div>
  );
}
