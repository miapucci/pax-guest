import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import { createServerClient } from '@supabase/ssr';
import { Resend } from 'resend';
import { type NextRequest } from 'next/server';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const supabase = createClient(
  'https://vkuwtrgiccizasjwkidi.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  const resend = new Resend(process.env.RESEND_API_KEY);
  try {
    // Verify the caller is an authenticated host
    const authClient = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { getAll() { return req.cookies.getAll(); }, setAll() {} } }
    );
    const { data: { user } } = await authClient.auth.getUser();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { requestId } = await req.json();
    if (!requestId) return Response.json({ error: 'Missing requestId' }, { status: 400 });

    const { data: request, error } = await supabase
      .from('upsell_requests')
      .select('*, properties(nickname, host_id)')
      .eq('id', requestId)
      .single();

    if (error || !request) {
      return Response.json({ error: 'Request not found' }, { status: 404 });
    }

    // Ownership check — only the host who owns the property can decline
    if (request.properties.host_id !== user.id) {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (request.status !== 'pending') {
      return Response.json({ error: 'Request already handled' }, { status: 400 });
    }

    // Atomic claim: flip pending → declined only if still pending, so a
    // concurrent approve/decline can't both process this request.
    const { data: claimed } = await supabase
      .from('upsell_requests')
      .update({ status: 'declined' })
      .eq('id', requestId)
      .eq('status', 'pending')
      .select('id');

    if (!claimed || claimed.length === 0) {
      return Response.json({ error: 'Request already handled' }, { status: 400 });
    }

    // Cancel the PaymentIntent — releases the hold on the guest's card
    if (request.payment_intent_id) {
      try {
        await stripe.paymentIntents.cancel(request.payment_intent_id);
      } catch (e: any) {
        // Already-canceled is fine; anything else releases the claim so the
        // host can retry — never leave a hold dangling on a "declined" request.
        if (e?.code !== 'payment_intent_unexpected_state') {
          await supabase.from('upsell_requests').update({ status: 'pending' }).eq('id', requestId);
          return Response.json({ error: e.message ?? 'Could not release the card hold' }, { status: 500 });
        }
      }
    }

    // Notify guest — best-effort; the decline already succeeded
    const typeLabel = request.type === 'late_checkout' ? 'Late Checkout' : 'Early Check-in';
    const fromEmail = process.env.RESEND_FROM_EMAIL ?? 'onboarding@resend.dev';

    try {
    await resend.emails.send({
      from: `Pax <${fromEmail}>`,
      to: [request.guest_email],
      subject: `Your ${typeLabel} request at ${request.properties.nickname}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head><meta charset="utf-8" /></head>
          <body style="margin:0;padding:0;background:#09080c;font-family:'Georgia',serif;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#09080c;padding:40px 20px;">
              <tr><td align="center">
                <table width="560" cellpadding="0" cellspacing="0" style="background:#13111a;border-radius:20px;border:1px solid rgba(255,255,255,0.08);overflow:hidden;">
                  <tr>
                    <td style="background:linear-gradient(135deg,#1a1408,#211b0a);padding:32px 40px;border-bottom:1px solid rgba(255,255,255,0.06);">
                      <p style="margin:0;font-family:'Georgia',serif;font-size:22px;color:#C9A96E;letter-spacing:3px;text-transform:uppercase;">PAX</p>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:40px;">
                      <p style="margin:0 0 8px;font-size:13px;color:rgba(237,230,211,0.4);letter-spacing:1.5px;text-transform:uppercase;">${typeLabel} · Unavailable</p>
                      <h1 style="margin:0 0 24px;font-family:'Georgia',serif;font-size:28px;font-weight:400;color:#EDE6D3;line-height:1.3;">
                        Sorry, ${request.guest_name.split(' ')[0]}.
                      </h1>
                      <p style="margin:0 0 28px;font-size:15px;color:rgba(237,230,211,0.65);line-height:1.7;">
                        Your host wasn't able to accommodate a <strong style="color:#EDE6D3;">${typeLabel.toLowerCase()}</strong> at
                        <strong style="color:#EDE6D3;">${request.properties.nickname}</strong> this time.
                        <br /><br />
                        No charge was made — the hold on your card has been fully released.
                      </p>
                      <div style="height:1px;background:rgba(255,255,255,0.06);margin:0 0 28px;"></div>
                      <p style="margin:0;font-size:13px;color:rgba(237,230,211,0.35);line-height:1.7;">
                        We hope the rest of your stay is wonderful.
                      </p>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:20px 40px;border-top:1px solid rgba(255,255,255,0.06);">
                      <p style="margin:0;font-size:11px;color:rgba(237,230,211,0.2);line-height:1.6;">
                        Zuzi Development LLC · Guest data is encrypted and auto-deleted after 14 days.
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
    } catch {}

    return Response.json({ success: true });
  } catch (e: any) {
    return Response.json({ error: e.message ?? 'Internal error' }, { status: 500 });
  }
}
