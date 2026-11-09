export default function Loader({ label = 'লোড হচ্ছে…' }) {
  return (
    <div className="grid place-items-center py-24 text-ink-muted">
      <div className="flex flex-col items-center gap-3">
        <span className="w-8 h-8 rounded-full border-2 border-line border-t-accent animate-spin" />
        <span className="text-sm">{label}</span>
      </div>
    </div>
  );
}
