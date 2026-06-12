import { createServerClient } from '@supabase/ssr';
import { createServiceClient } from '@/lib/supabase/service';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll(); },
        setAll() {},
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const formData = await request.formData();
  const file = formData.get('file') as File | null;
  const bucket = (formData.get('bucket') as string) || 'property-photos';

  // Service-role upload — never let the client pick an arbitrary bucket
  if (bucket !== 'property-photos' && bucket !== 'property-videos') {
    return NextResponse.json({ error: 'Invalid bucket' }, { status: 400 });
  }

  if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 });

  const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/heic'];
  const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/quicktime', 'video/webm'];
  const allowed = bucket === 'property-videos' ? ALLOWED_VIDEO_TYPES : ALLOWED_IMAGE_TYPES;
  if (!allowed.includes(file.type)) {
    return NextResponse.json({ error: 'Unsupported file type' }, { status: 400 });
  }

  const MAX_BYTES = bucket === 'property-videos' ? 200 * 1024 * 1024 : 10 * 1024 * 1024;
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: `File too large (max ${MAX_BYTES / 1024 / 1024} MB)` }, { status: 400 });
  }

  const ext = file.name.split('.').pop()?.toLowerCase() ?? 'bin';
  const path = `${user.id}/${Date.now()}.${ext}`;

  const db = createServiceClient();
  const { error: uploadError } = await db.storage
    .from(bucket)
    .upload(path, file, { contentType: file.type, upsert: false });

  if (uploadError) return NextResponse.json({ error: uploadError.message }, { status: 500 });

  const { data: { publicUrl } } = db.storage.from(bucket).getPublicUrl(path);

  return NextResponse.json({ url: publicUrl });
}
