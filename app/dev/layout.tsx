import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import DevNav from './_components/DevNav';

const DEV_EMAIL = 'mialilypucci@gmail.com';

const white = '#F8FAFC';
const sans  = "var(--font-inter), -apple-system, 'Inter', sans-serif";

export default async function DevLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || user.email !== DEV_EMAIL) redirect('/');

  return (
    <div style={{ minHeight: '100dvh', background: '#080910', color: white, fontFamily: sans }}>
      <DevNav />
      <main className="fade-up" style={{ maxWidth: '1300px', margin: '0 auto', padding: '36px 32px' }}>
        {children}
      </main>
    </div>
  );
}
