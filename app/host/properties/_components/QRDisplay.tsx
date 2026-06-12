'use client';

import { useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';

const teal  = '#14B8A6';
const white = '#F8FAFC';
const muted = 'rgba(248,250,252,0.42)';
const sans  = "var(--font-inter), -apple-system, 'Inter', sans-serif";
const serif = "var(--font-playfair), 'Playfair Display', Georgia, serif";

type Props = {
  propertyId: string;
  propertyName: string;
};

export default function QRDisplay({ propertyId, propertyName }: Props) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? (typeof window !== 'undefined' ? window.location.origin : 'https://paxhq.co');
  const guestUrl = `${baseUrl}/g/${propertyId}`;
  const printRef = useRef<HTMLDivElement>(null);

  function handlePrint() {
    const el = printRef.current;
    if (!el) return;
    const win = window.open('', '_blank');
    if (!win) return;
    win.document.write(`
      <html><head><title>Pax QR — ${propertyName}</title>
      <style>
        body { margin: 0; background: #fff; display: flex; align-items: center; justify-content: center; min-height: 100vh; font-family: Georgia, serif; }
        .card { text-align: center; padding: 48px; border: 2px solid #e5e7eb; border-radius: 24px; max-width: 400px; }
        h1 { font-size: 28px; font-weight: 400; color: #111; margin: 0 0 6px; }
        p { font-size: 14px; color: #6b7280; margin: 0 0 32px; }
        .qr { margin: 0 auto 24px; }
        .url { font-size: 11px; color: #9ca3af; letter-spacing: 0.3px; word-break: break-all; }
        .brand { margin-top: 28px; font-size: 12px; color: #d1d5db; letter-spacing: 2px; text-transform: uppercase; }
        @media print { @page { margin: 0; } }
      </style></head><body>
      <div class="card">
        <h1>${propertyName}</h1>
        <p>Scan to access your guest guide</p>
        <div class="qr">${el.querySelector('svg')?.outerHTML ?? ''}</div>
        <div class="url">${guestUrl}</div>
        <div class="brand">Powered by Pax</div>
      </div>
      </body></html>
    `);
    win.document.close();
    win.print();
  }

  async function handleCopyUrl() {
    await navigator.clipboard.writeText(guestUrl);
  }

  return (
    <div style={{ maxWidth: '480px' }}>
      {/* QR card */}
      <div ref={printRef} style={{
        background: 'rgba(255,255,255,0.028)', border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: '20px', padding: '40px', textAlign: 'center', marginBottom: '20px',
      }}>
        {/* White background for the QR so it scans cleanly */}
        <div style={{ display: 'inline-block', background: '#fff', padding: '20px', borderRadius: '16px', marginBottom: '24px' }}>
          <QRCodeSVG
            value={guestUrl}
            size={200}
            level="M"
            fgColor="#0c0d12"
            bgColor="#ffffff"
          />
        </div>

        <div style={{ fontFamily: serif, fontSize: '20px', fontWeight: 400, color: white, marginBottom: '6px' }}>
          {propertyName}
        </div>
        <div style={{ fontFamily: sans, fontSize: '12px', fontWeight: 300, color: muted, marginBottom: '16px', wordBreak: 'break-all' }}>
          {guestUrl}
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: '10px' }}>
        <button onClick={handlePrint} className="lift" style={{
          flex: 1, fontFamily: sans, fontSize: '14px', fontWeight: 600,
          color: white, background: `linear-gradient(135deg, #0D9488, #10B981)`,
          border: 'none', borderRadius: '10px', padding: '13px',
          cursor: 'pointer', boxShadow: '0 4px 20px rgba(13,148,136,0.25)',
        }}>
          Print QR code
        </button>
        <button onClick={handleCopyUrl} style={{
          flex: 1, fontFamily: sans, fontSize: '14px', fontWeight: 500,
          color: teal, background: 'rgba(20,184,166,0.06)',
          border: '1px solid rgba(20,184,166,0.25)', borderRadius: '10px', padding: '13px',
          cursor: 'pointer',
        }}>
          Copy guest link
        </button>
      </div>

      <div style={{ marginTop: '16px', padding: '14px 16px', background: 'rgba(20,184,166,0.05)', border: '1px solid rgba(20,184,166,0.1)', borderRadius: '10px' }}>
        <p style={{ fontFamily: sans, fontSize: '12px', fontWeight: 300, color: muted, margin: 0, lineHeight: 1.7 }}>
          Place this QR code in your property — on the fridge, welcome card, or entryway. Guests scan it to access their guide.
        </p>
      </div>
    </div>
  );
}
