import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';
import { getBaseUrl } from '@/lib/base-url';

const supabase = createClient(
  'https://vkuwtrgiccizasjwkidi.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

// Called by a Supabase Database Webhook on INSERT into upsell_requests.
// Web-era: email the host (their money is waiting). Legacy iOS push kept
// as best-effort for any account that still has a push token.
export async function POST(req: NextRequest) {
  const secret = req.headers.get('x-webhook-secret');
  if (secret !== process.env.WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const record = body.record;

  if (!record?.property_id) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }

  const { data: property } = await supabase
    .from('properties')
    .select('host_id, nickname, late_checkout_price, early_checkin_price')
    .eq('id', record.property_id)
    .single();

  if (!property) {
    return NextResponse.json({ message: 'Property not found' }, { status: 200 });
  }

  const { data: { user } } = await supabase.auth.admin.getUserById(property.host_id);

  const isLate    = record.type === 'late_checkout';
  const typeLabel = isLate ? 'Late Checkout' : 'Early Check-in';
  const amount    = record.amount != null
    ? (record.amount / 100)
    : (isLate ? property.late_checkout_price : property.early_checkin_price);
  const requestsUrl = `${getBaseUrl()}/host/requests`;

  const results: Record<string, string> = {};

  // ── Email (primary channel for web hosts) ──
  if (user?.email) {
    try {
      const resend = new Resend(process.env.RESEND_API_KEY);
      const fromEmail = process.env.RESEND_FROM_EMAIL ?? 'onboarding@resend.dev';
      await resend.emails.send({
        from: `Pax <${fromEmail}>`,
        to: [user.email],
        subject: `New ${typeLabel} request — $${amount} at ${property.nickname}`,
        html: `
          <!DOCTYPE html>
          <html>
            <head><meta charset="utf-8" /></head>
            <body style="margin:0;padding:0;background:#0c0d12;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#0c0d12;padding:40px 20px;">
                <tr><td align="center">
                  <table width="560" cellpadding="0" cellspacing="0" style="background:#13151c;border-radius:20px;border:1px solid rgba(20,184,166,0.18);overflow:hidden;">
                    <tr>
                      <td style="padding:32px 40px;border-bottom:1px solid rgba(255,255,255,0.06);">
                        <p style="margin:0;font-family:Georgia,serif;font-size:22px;color:#14B8A6;letter-spacing:3px;text-transform:uppercase;">PAX</p>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding:40px;">
                        <p style="margin:0 0 8px;font-size:13px;color:rgba(94,234,212,0.8);letter-spacing:1.5px;text-transform:uppercase;">New request · Action needed</p>
                        <h1 style="margin:0 0 24px;font-family:Georgia,serif;font-size:28px;font-weight:400;color:#F8FAFC;line-height:1.3;">
                          ${record.guest_name ?? 'A guest'} wants a ${typeLabel.toLowerCase()}.
                        </h1>
                        <table cellpadding="0" cellspacing="0" style="background:rgba(20,184,166,0.06);border:1px solid rgba(20,184,166,0.18);border-radius:14px;width:100%;margin:0 0 28px;">
                          <tr>
                            <td style="padding:20px 24px;">
                              <p style="margin:0 0 4px;font-size:13px;color:rgba(248,250,252,0.45);">${property.nickname}</p>
                              <p style="margin:0;font-size:15px;color:#F8FAFC;">
                                ${typeLabel} · <strong style="color:#5EEAD4;">$${amount}</strong>
                              </p>
                              ${record.note ? `<p style="margin:12px 0 0;font-size:13px;color:rgba(248,250,252,0.5);font-style:italic;">"${String(record.note).replace(/</g, '&lt;')}"</p>` : ''}
                            </td>
                          </tr>
                        </table>
                        <p style="margin:0 0 28px;font-size:14px;color:rgba(248,250,252,0.55);line-height:1.7;">
                          Their card is on hold — you're only paid if you approve, and the hold
                          releases automatically if you decline.
                        </p>
                        <a href="${requestsUrl}" style="display:inline-block;background:#0D9488;color:#F8FAFC;font-size:14px;font-weight:600;padding:14px 32px;border-radius:12px;text-decoration:none;">
                          Review request →
                        </a>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding:20px 40px;border-top:1px solid rgba(255,255,255,0.06);">
                        <p style="margin:0;font-size:11px;color:rgba(248,250,252,0.25);line-height:1.6;">
                          Zuzi Development LLC · You're receiving this because a guest made a request at your property.
                        </p>
                      </td>
                    </tr>
                  </table>
                </td></tr>
              </table>
            </body>
          </html>
        `,
      });
      results.email = 'sent';
    } catch (e: any) {
      results.email = `failed: ${e.message}`;
    }
  } else {
    results.email = 'no email on host account';
  }

  // ── Legacy iOS push (best-effort) ──
  const pushToken = user?.user_metadata?.push_token;
  if (pushToken) {
    try {
      await fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({
          to: pushToken,
          title: `New ${typeLabel} Request — $${amount}`,
          body: `${record.guest_name} at ${property.nickname} — tap to approve`,
          sound: 'default',
          badge: 1,
          data: { requestId: record.id, type: record.type },
        }),
      });
      results.push = 'sent';
    } catch (e: any) {
      results.push = `failed: ${e.message}`;
    }
  }

  return NextResponse.json({ success: true, results });
}
