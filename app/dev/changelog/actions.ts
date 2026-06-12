'use server';

import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/service';
import { revalidatePath } from 'next/cache';

const DEV_EMAIL = 'mialilypucci@gmail.com';

export async function addChangelogEntry(formData: FormData): Promise<void> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.email !== DEV_EMAIL) return;

  const title = (formData.get('title') as string)?.trim();
  const body  = (formData.get('body') as string)?.trim();
  const tag   = (formData.get('tag') as string) || 'feature';

  if (!title) return;

  const db = createServiceClient();
  await db.from('changelog').insert({ title, body: body || null, tag });

  revalidatePath('/dev/changelog');
}
