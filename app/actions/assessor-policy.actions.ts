'use server';

import { revalidatePath } from 'next/cache';
import { getSession } from '@/lib/auth/session';
import { assessorCreatePolicy } from '@/services/assessor-policy.service';
import { AssessorCreatePolicyInput } from '@/lib/validators/policy.validators';
import { ActionResponse, SerializedPolicy } from '@/types';

export async function createAssessorPolicyAction(
  data: AssessorCreatePolicyInput
): Promise<ActionResponse<SerializedPolicy>> {
  const session = await getSession();
  if (!session || session.role !== 'ASSESSOR') {
    return { success: false, message: 'Unauthorized' };
  }

  try {
    const policy = await assessorCreatePolicy(data, session.id);
    
    // Revalidate paths so the new policy shows up
    revalidatePath('/assessor/policies');
    revalidatePath('/admin/policies');
    
    return { success: true, message: 'Policy created and sent for admin approval.', data: policy };
  } catch (err: any) {
    return { success: false, message: err.message };
  }
}
