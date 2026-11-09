import { Star } from 'lucide-react';

/** রেটিং স্টার — মান ও সংখ্যা দেখায় */
export default function Rating({ value = 0, count = 0, size = 14, showCount = true }) {
  const v = Number(value || 0);
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((i) => (
          <Star
            key={i}
            size={size}
            className={i <= Math.round(v) ? 'text-accent fill-accent' : 'text-line'}
          />
        ))}
      </div>
      {showCount && (
        <span className="text-xs text-ink-muted">
          {v.toFixed(1)}{count ? ` (${count})` : ''}
        </span>
      )}
    </div>
  );
}
