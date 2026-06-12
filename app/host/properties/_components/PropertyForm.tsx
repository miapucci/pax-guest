'use client';

import { useState, useRef } from 'react';
import { createProperty, updateProperty, deleteProperty, type PropertyInput } from '../actions';

const teal    = '#14B8A6';
const tealD   = '#0D9488';
const white   = '#F8FAFC';
const muted   = 'rgba(248,250,252,0.42)';
const border  = 'rgba(255,255,255,0.07)';
const sans    = "var(--font-inter), -apple-system, 'Inter', sans-serif";
const serif   = "var(--font-playfair), 'Playfair Display', Georgia, serif";

const CATEGORIES = [
  { value: 'food',       label: '🍽️ Dining' },
  { value: 'cafe',       label: '☕ Café' },
  { value: 'bar',        label: '🍷 Cocktails' },
  { value: 'attraction', label: '🗺️ Experiences' },
  { value: 'shopping',   label: '🛍️ Shopping' },
  { value: 'transport',  label: '🚌 Transport' },
];

type Rec = { name: string; category: string; note: string };
type Vid = { title: string; url: string };

type Props = {
  property?: {
    id: string;
    nickname: string;
    address: string | null;
    welcome_message: string | null;
    review_url: string | null;
    wifi_name: string | null;
    wifi_password: string | null;
    checkin_instructions: string | null;
    house_rules: string | null;
    late_checkout_enabled: boolean;
    late_checkout_price: number;
    early_checkin_enabled: boolean;
    early_checkin_price: number;
    cover_photo_url: string | null;
    local_recommendations: Rec[] | null;
    property_videos: Vid[] | null;
  };
};

function inputStyle(extra?: React.CSSProperties): React.CSSProperties {
  return {
    width: '100%', fontFamily: sans, fontSize: '14px', fontWeight: 300,
    color: white, background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px',
    padding: '11px 14px', boxSizing: 'border-box',
    ...extra,
  };
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <label style={{ display: 'block', fontFamily: sans, fontSize: '11px', fontWeight: 500, color: 'rgba(248,250,252,0.45)', letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: '6px' }}>
      {children}
    </label>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ background: 'rgba(255,255,255,0.022)', border: `1px solid ${border}`, borderRadius: '16px', padding: '28px', marginBottom: '16px' }}>
      <h3 style={{ fontFamily: serif, fontSize: '18px', fontWeight: 400, color: white, margin: '0 0 22px', letterSpacing: '-0.2px' }}>{title}</h3>
      {children}
    </div>
  );
}

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      style={{
        display: 'flex', alignItems: 'center', gap: '10px',
        background: 'none', border: 'none', cursor: 'pointer', padding: 0,
      }}
    >
      <div style={{
        width: '40px', height: '22px', borderRadius: '11px', flexShrink: 0,
        background: checked ? teal : 'rgba(255,255,255,0.1)',
        position: 'relative', transition: 'background 0.2s',
      }}>
        <div style={{
          position: 'absolute', top: '3px',
          left: checked ? '21px' : '3px',
          width: '16px', height: '16px', borderRadius: '50%',
          background: white, transition: 'left 0.2s',
        }} />
      </div>
      <span style={{ fontFamily: sans, fontSize: '14px', fontWeight: 300, color: checked ? white : muted }}>{label}</span>
    </button>
  );
}

export default function PropertyForm({ property }: Props) {
  const isEdit = !!property;

  const [form, setForm] = useState({
    nickname:              property?.nickname ?? '',
    address:               property?.address ?? '',
    welcome_message:       property?.welcome_message ?? '',
    review_url:            property?.review_url ?? '',
    wifi_name:             property?.wifi_name ?? '',
    wifi_password:         property?.wifi_password ?? '',
    checkin_instructions:  property?.checkin_instructions ?? '',
    house_rules:           property?.house_rules ?? '',
    late_checkout_enabled: property?.late_checkout_enabled ?? false,
    late_checkout_price:   property?.late_checkout_price ?? 25,
    early_checkin_enabled: property?.early_checkin_enabled ?? false,
    early_checkin_price:   property?.early_checkin_price ?? 25,
    cover_photo_url:       property?.cover_photo_url ?? null as string | null,
  });

  const [recs, setRecs] = useState<Rec[]>(property?.local_recommendations ?? []);
  const [videos, setVideos] = useState<Vid[]>(property?.property_videos ?? []);
  const [coverFile, setCoverFile]       = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(property?.cover_photo_url ?? null);
  const [saving, setSaving]   = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError]     = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const set = <K extends keyof typeof form>(k: K, v: typeof form[K]) =>
    setForm(f => ({ ...f, [k]: v }));

  function handleCoverChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setCoverFile(file);
    setCoverPreview(URL.createObjectURL(file));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.nickname.trim()) { setError('Property nickname is required.'); return; }
    if (form.late_checkout_enabled && form.late_checkout_price <= 0) { setError('Late checkout price must be greater than $0.'); return; }
    if (form.early_checkin_enabled && form.early_checkin_price <= 0) { setError('Early check-in price must be greater than $0.'); return; }

    setSaving(true);
    setError('');

    try {
      let coverUrl = form.cover_photo_url;

      if (coverFile) {
        const fd = new FormData();
        fd.append('file', coverFile);
        fd.append('bucket', 'property-photos');
        const res = await fetch('/api/host/upload', { method: 'POST', body: fd });
        const { url, error: uploadErr } = await res.json();
        if (uploadErr) throw new Error(uploadErr);
        coverUrl = url;
      }

      const data: PropertyInput = {
        ...form,
        cover_photo_url: coverUrl,
        local_recommendations: recs.filter(r => r.name.trim()),
        property_videos: videos.filter(v => v.title.trim() && v.url.trim()),
      };

      const result = isEdit
        ? await updateProperty(property.id, data)
        : await createProperty(data);

      if (result?.error) throw new Error(result.error);
      // redirect() from server action takes over — we won't reach here on success
    } catch (e: any) {
      setError(e.message ?? 'Something went wrong');
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!property) return;
    if (!confirm(`Delete "${property.nickname}"? This cannot be undone.`)) return;
    setDeleting(true);
    const result = await deleteProperty(property.id);
    if (result?.error) { alert(result.error); setDeleting(false); }
  }

  return (
    <form onSubmit={handleSubmit}>
      {/* Basics */}
      <Section title="Basics">
        <div className="form-grid-2" style={{ marginBottom: '14px' }}>
          <div>
            <Label>Property nickname *</Label>
            <input value={form.nickname} onChange={e => set('nickname', e.target.value)} placeholder="The Beach House" required style={inputStyle()} />
          </div>
          <div>
            <Label>Address</Label>
            <input value={form.address} onChange={e => set('address', e.target.value)} placeholder="123 Ocean Drive, Miami, FL" style={inputStyle()} />
          </div>
        </div>
        <div style={{ marginBottom: '14px' }}>
          <Label>Welcome message</Label>
          <textarea value={form.welcome_message} onChange={e => set('welcome_message', e.target.value)}
            placeholder="Welcome to our home! We hope you enjoy your stay…"
            rows={3} style={inputStyle({ resize: 'vertical' })} />
        </div>
        <div>
          <Label>Review link (optional)</Label>
          <input value={form.review_url} onChange={e => set('review_url', e.target.value)} placeholder="https://airbnb.com/..." style={inputStyle()} />
        </div>
      </Section>

      {/* Arrival info */}
      <Section title="Arrival">
        <div className="form-grid-2" style={{ marginBottom: '14px' }}>
          <div>
            <Label>Wi-Fi network name</Label>
            <input value={form.wifi_name} onChange={e => set('wifi_name', e.target.value)} placeholder="HomeNetwork_5G" style={inputStyle()} />
          </div>
          <div>
            <Label>Wi-Fi password</Label>
            <input value={form.wifi_password} onChange={e => set('wifi_password', e.target.value)} placeholder="mypassword123" style={inputStyle()} />
          </div>
        </div>
        <div>
          <Label>Check-in instructions (one step per line)</Label>
          <textarea value={form.checkin_instructions} onChange={e => set('checkin_instructions', e.target.value)}
            placeholder={'Use the lockbox on the front door — code is 4819\nPark in the driveway on the right\nThe key is inside — return it to the lockbox on checkout'}
            rows={5} style={inputStyle({ resize: 'vertical', lineHeight: '1.7' })} />
        </div>
      </Section>

      {/* House rules */}
      <Section title="House rules">
        <Label>Rules (one per line)</Label>
        <textarea value={form.house_rules} onChange={e => set('house_rules', e.target.value)}
          placeholder={'No smoking indoors\nNo parties or events\nQuiet hours after 10pm\nPets allowed with prior approval'}
          rows={5} style={inputStyle({ resize: 'vertical', lineHeight: '1.7' })} />
      </Section>

      {/* Upsells */}
      <Section title="Upsells">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <Toggle checked={form.late_checkout_enabled} onChange={v => set('late_checkout_enabled', v)} label="Late checkout" />
            {form.late_checkout_enabled && (
              <div style={{ marginTop: '12px', maxWidth: '200px' }}>
                <Label>Price ($)</Label>
                <input type="number" min="1" step="1"
                  value={form.late_checkout_price}
                  onChange={e => set('late_checkout_price', Number(e.target.value))}
                  style={inputStyle()} />
              </div>
            )}
          </div>
          <div>
            <Toggle checked={form.early_checkin_enabled} onChange={v => set('early_checkin_enabled', v)} label="Early check-in" />
            {form.early_checkin_enabled && (
              <div style={{ marginTop: '12px', maxWidth: '200px' }}>
                <Label>Price ($)</Label>
                <input type="number" min="1" step="1"
                  value={form.early_checkin_price}
                  onChange={e => set('early_checkin_price', Number(e.target.value))}
                  style={inputStyle()} />
              </div>
            )}
          </div>
        </div>
      </Section>

      {/* Cover photo */}
      <Section title="Cover photo">
        <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp,image/heic" onChange={handleCoverChange} style={{ display: 'none' }} />
        {coverPreview ? (
          <div style={{ position: 'relative', marginBottom: '14px' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={coverPreview} alt="Cover" style={{ width: '100%', height: '220px', objectFit: 'cover', borderRadius: '12px', border: `1px solid ${border}` }} />
            <button type="button" onClick={() => { setCoverFile(null); setCoverPreview(null); set('cover_photo_url', null); fileRef.current!.value = ''; }}
              style={{ position: 'absolute', top: '10px', right: '10px', background: 'rgba(0,0,0,0.6)', border: 'none', borderRadius: '8px', color: white, fontFamily: sans, fontSize: '12px', padding: '5px 10px', cursor: 'pointer' }}>
              Remove
            </button>
          </div>
        ) : (
          <div onClick={() => fileRef.current?.click()}
            style={{ height: '120px', border: `2px dashed rgba(255,255,255,0.1)`, borderRadius: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', gap: '8px', marginBottom: '14px' }}>
            <div style={{ fontFamily: sans, fontSize: '13px', fontWeight: 400, color: muted }}>Click to upload cover photo</div>
            <div style={{ fontFamily: sans, fontSize: '11px', color: 'rgba(248,250,252,0.25)' }}>JPG, PNG, WEBP — max 10 MB</div>
          </div>
        )}
        {!coverPreview && (
          <button type="button" onClick={() => fileRef.current?.click()}
            style={{ fontFamily: sans, fontSize: '13px', fontWeight: 500, color: teal, background: 'none', border: `1px solid rgba(20,184,166,0.25)`, borderRadius: '8px', padding: '8px 16px', cursor: 'pointer' }}>
            Choose photo
          </button>
        )}
      </Section>

      {/* Local recommendations */}
      <Section title="Local guide">
        <p style={{ fontFamily: sans, fontSize: '13px', fontWeight: 300, color: muted, margin: '0 0 18px', lineHeight: 1.6 }}>
          Add places you recommend — guests see these on their Local Guide tab.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '14px' }}>
          {recs.map((rec, i) => (
            <div key={i} className="rec-row">
              <div>
                {i === 0 && <Label>Name</Label>}
                <input value={rec.name} onChange={e => setRecs(r => r.map((x, j) => j === i ? { ...x, name: e.target.value } : x))}
                  placeholder="Zuma Restaurant" style={inputStyle()} />
              </div>
              <div>
                {i === 0 && <Label>Category</Label>}
                <select value={rec.category} onChange={e => setRecs(r => r.map((x, j) => j === i ? { ...x, category: e.target.value } : x))}
                  style={{ ...inputStyle(), appearance: 'none' }}>
                  {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </div>
              <div>
                {i === 0 && <Label>Note (optional)</Label>}
                <input value={rec.note} onChange={e => setRecs(r => r.map((x, j) => j === i ? { ...x, note: e.target.value } : x))}
                  placeholder="Best patio in town" style={inputStyle()} />
              </div>
              <div>
                <button type="button" onClick={() => setRecs(r => r.filter((_, j) => j !== i))}
                  style={{ width: '34px', height: '38px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)', borderRadius: '8px', color: '#FCA5A5', fontSize: '16px', cursor: 'pointer' }}>
                  ×
                </button>
              </div>
            </div>
          ))}
        </div>
        <button type="button" onClick={() => setRecs(r => [...r, { name: '', category: 'food', note: '' }])}
          style={{ fontFamily: sans, fontSize: '13px', fontWeight: 500, color: teal, background: 'rgba(20,184,166,0.05)', border: `1px solid rgba(20,184,166,0.2)`, borderRadius: '8px', padding: '8px 16px', cursor: 'pointer' }}>
          + Add recommendation
        </button>
      </Section>

      {/* Videos (URL entry — upload UI comes later) */}
      <Section title="Video guides">
        <p style={{ fontFamily: sans, fontSize: '13px', fontWeight: 300, color: muted, margin: '0 0 18px', lineHeight: 1.6 }}>
          Add short video guides for guests — check-in walkthroughs, appliance tips, parking.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '14px' }}>
          {videos.map((vid, i) => (
            <div key={i} className="video-row">
              <div>
                {i === 0 && <Label>Title</Label>}
                <input value={vid.title} onChange={e => setVideos(v => v.map((x, j) => j === i ? { ...x, title: e.target.value } : x))}
                  placeholder="Check-in walkthrough" style={inputStyle()} />
              </div>
              <div>
                {i === 0 && <Label>Video URL</Label>}
                <input value={vid.url} onChange={e => setVideos(v => v.map((x, j) => j === i ? { ...x, url: e.target.value } : x))}
                  placeholder="https://..." style={inputStyle()} />
              </div>
              <div>
                <button type="button" onClick={() => setVideos(v => v.filter((_, j) => j !== i))}
                  style={{ width: '34px', height: '38px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)', borderRadius: '8px', color: '#FCA5A5', fontSize: '16px', cursor: 'pointer' }}>
                  ×
                </button>
              </div>
            </div>
          ))}
        </div>
        <button type="button" onClick={() => setVideos(v => [...v, { title: '', url: '' }])}
          style={{ fontFamily: sans, fontSize: '13px', fontWeight: 500, color: teal, background: 'rgba(20,184,166,0.05)', border: `1px solid rgba(20,184,166,0.2)`, borderRadius: '8px', padding: '8px 16px', cursor: 'pointer' }}>
          + Add video
        </button>
      </Section>

      {/* Error */}
      {error && (
        <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '10px', padding: '12px 16px', fontFamily: sans, fontSize: '13px', color: '#FCA5A5', marginBottom: '16px' }}>
          {error}
        </div>
      )}

      {/* Actions */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', paddingTop: '8px', flexWrap: 'wrap' }}>
        <a href="/host/properties" style={{ fontFamily: sans, fontSize: '13px', color: muted, textDecoration: 'none' }}>
          ← Cancel
        </a>
        <div style={{ display: 'flex', gap: '10px' }}>
          {isEdit && (
            <button type="button" onClick={handleDelete} disabled={deleting}
              style={{ fontFamily: sans, fontSize: '13px', fontWeight: 500, color: '#FCA5A5', background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.15)', borderRadius: '10px', padding: '11px 20px', cursor: deleting ? 'not-allowed' : 'pointer', opacity: deleting ? 0.6 : 1 }}>
              {deleting ? 'Deleting…' : 'Delete property'}
            </button>
          )}
          <button type="submit" disabled={saving}
            style={{ fontFamily: sans, fontSize: '14px', fontWeight: 600, color: white, background: saving ? 'rgba(20,184,166,0.4)' : `linear-gradient(135deg, ${tealD}, #10B981)`, border: 'none', borderRadius: '10px', padding: '11px 28px', cursor: saving ? 'not-allowed' : 'pointer', boxShadow: saving ? 'none' : '0 4px 20px rgba(13,148,136,0.25)' }}>
            {saving ? (isEdit ? 'Saving…' : 'Creating…') : (isEdit ? 'Save changes' : 'Create property')}
          </button>
        </div>
      </div>
    </form>
  );
}
