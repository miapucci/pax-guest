export default function NotFound() {
  return (
    <div className="min-h-dvh flex flex-col items-center justify-center px-6 text-center">
      <div className="text-4xl mb-4">🔍</div>
      <h1 className="text-xl font-semibold text-white mb-2">Property not found</h1>
      <p className="text-sm text-white/40 leading-relaxed max-w-xs">
        This QR code may be invalid or the property may no longer be active.
        Please contact your host directly.
      </p>
    </div>
  );
}
