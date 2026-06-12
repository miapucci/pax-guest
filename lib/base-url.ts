// Canonical site URL. Tolerates a scheme-less env value ("paxhq.co") —
// Stripe rejects redirect URLs without http(s)://, so never trust the raw var.
export function getBaseUrl(): string {
  const raw = (process.env.NEXT_PUBLIC_BASE_URL ?? '').trim().replace(/\/+$/, '');
  if (!raw) return 'https://paxhq.co';
  return /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
}
