'use client';

import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export function SignOutButton() {
  const router = useRouter();

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  }

  const sans = "var(--font-inter), -apple-system, 'Inter', sans-serif";

  return (
    <button
      onClick={signOut}
      style={{
        fontFamily: sans, fontSize: '13px', fontWeight: 400,
        color: 'rgba(248,250,252,0.38)', background: 'none',
        border: 'none', cursor: 'pointer', padding: '8px 12px',
        borderRadius: '8px', transition: 'color 0.15s',
        letterSpacing: '0.1px',
      }}
    >
      Sign out
    </button>
  );
}
