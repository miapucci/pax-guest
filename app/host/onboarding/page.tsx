import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/service';
import OnboardingWizard from './_components/OnboardingWizard';

export const metadata: Metadata = { title: 'Welcome to Pax' };

export default async function OnboardingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/');

  // Hosts who already have a property don't need onboarding
  const db = createServiceClient();
  const { count } = await db
    .from('properties')
    .select('*', { count: 'exact', head: true })
    .eq('host_id', user.id);

  if ((count ?? 0) > 0) redirect('/host');

  return <OnboardingWizard />;
}
