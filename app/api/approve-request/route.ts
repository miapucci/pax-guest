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
      .select('*, properties(nickname, host_id, total_earned, checkout_count, early_checkin_count)')
      .eq('id', requestId)
      .single();

    if (error || !request) {
      return Response.json({ error: 'Request not found' }, { status: 404 });
    }

    // Ownership check — only the host who owns the property can approve
    if (request.properties.host_id !== user.id) {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (request.status !== 'pending') {
      return Response.json({ error: 'Request already handled' }, { status: 400 });
    }

    if (!request.payment_intent_id) {
      return Response.json({ error: 'No payment intent on this request' }, { status: 400 });
    }

    // Atomic claim: flip pending → approved only if still pending. Concurrent
    // approvals (double-click, two devices) lose the claim and exit here —
    // exactly one caller may capture the payment.
    const { data: claimed } = await supabase
      .from('upsell_requests')
      .update({ status: 'approved' })
      .eq('id', requestId)
      .eq('status', 'pending')
      .select('id');

    if (!claimed || claimed.length === 0) {
      return Response.json({ error: 'Request already handled' }, { status: 400 });
    }

    // Capture the authorized payment — this is when the guest's card is charged
    let pi: Stripe.PaymentIntent;
    try {
      pi = await stripe.paymentIntents.capture(request.payment_intent_id);
    } catch (e: any) {
      // Capture failed (hold expired, card issue) — release the claim so the
      // request stays actionable rather than stuck "approved" without payment.
      await supabase.from('upsell_requests').update({ status: 'pending' }).eq('id', requestId);
      return Response.json({ error: e.message ?? 'Payment capture failed' }, { status: 402 });
    }

    if (pi.status !== 'succeeded') {
      await supabase.from('upsell_requests').update({ status: 'pending' }).eq('id', requestId);
      return Response.json({ error: `Capture failed: ${pi.status}` }, { status: 402 });
    }

    // Update property earnings
    const prop = request.properties;
    const earned = pi.amount / 100;
    await supabase
      .from('properties')
      .update({
        total_earned: (prop.total_earned ?? 0) + earned,
        ...(request.type === 'late_checkout'
          ? { checkout_count: (prop.checkout_count ?? 0) + 1 }
          : { early_checkin_count: (prop.early_checkin_count ?? 0) + 1 }),
      })
      .eq('id', request.property_id);

    // Send confirmation email to guest — best-effort. The money has moved and the
    // request is approved; a failed email (e.g. Resend not configured) must NOT
    // surface as a failed approval to the host.
    const typeLabel = request.type === 'late_checkout' ? 'Late Checkout' : 'Early Check-in';
    const fromEmail = process.env.RESEND_FROM_EMAIL ?? 'onboarding@resend.dev';

    try {
    await resend.emails.send({
      from: `Pax <${fromEmail}>`,
      to: [request.guest_email],
      subject: `Your ${typeLabel} at ${prop.nickname} is confirmed`,
      html: `
        <!DOCTYPE html>
        <html>
          <head><meta charset="utf-8" /></head>
          <body style="margin:0;padding:0;background:#09080c;font-family:'Georgia',serif;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#09080c;padding:40px 20px;">
              <tr><td align="center">
                <table width="560" cellpadding="0" cellspacing="0" style="background:#13111a;border-radius:20px;border:1px solid rgba(201,169,110,0.18);overflow:hidden;">
                  <tr>
                    <td style="background:linear-gradient(135deg,#1a1408,#211b0a);padding:32px 40px;border-bottom:1px solid rgba(201,169,110,0.12);">
                      <p style="margin:0;font-family:'Georgia',serif;font-size:22px;color:#C9A96E;letter-spacing:3px;text-transform:uppercase;">PAX</p>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:40px;">
                      <p style="margin:0 0 8px;font-size:13px;color:rgba(201,169,110,0.7);letter-spacing:1.5px;text-transform:uppercase;">${typeLabel} · Approved</p>
                      <h1 style="margin:0 0 24px;font-family:'Georgia',serif;font-size:28px;font-weight:400;color:#EDE6D3;line-height:1.3;">
                        You're all set, ${request.guest_name.split(' ')[0]}.
                      </h1>
                      <p style="margin:0 0 28px;font-size:15px;color:rgba(237,230,211,0.65);line-height:1.7;">
                        Your <strong style="color:#EDE6D3;">${typeLabel.toLowerCase()}</strong> request at
                        <strong style="color:#EDE6D3;">${prop.nickname}</strong> has been approved by your host.
                        <br /><br />
                        A charge of <strong style="color:#C9A96E;">$${earned.toFixed(2)}</strong> has been applied to your card on file.
                      </p>
                      <div style="height:1px;background:rgba(201,169,110,0.12);margin:0 0 28px;"></div>
                      <p style="margin:0;font-size:13px;color:rgba(237,230,211,0.35);line-height:1.7;">
                        If you have any questions, reply to this email or contact your host directly.<br />Enjoy the extra time.
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

    return Response.json({ success: true, earned });
  } catch (e: any) {
    return Response.json({ error: e.message ?? 'Internal error' }, { status: 500 });
  }
}
