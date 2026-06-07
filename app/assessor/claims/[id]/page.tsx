import { redirect } from 'next/navigation';

export default async function ClaimReviewPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  redirect(`/assessor/review/${resolvedParams.id}`);
}
