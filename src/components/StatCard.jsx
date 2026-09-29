import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

/**
 * @param {Object} props
 * @param {React.ReactNode} props.icon
 * @param {string}  props.iconBg   - CSS color string for icon background
 * @param {string}  props.iconColor
 * @param {number}  props.value
 * @param {string}  props.label
 * @param {string}  [props.trend]  - 'up' | 'down' | 'neutral'
 * @param {string}  [props.trendLabel]
 * @param {string}  [props.accent] - border accent color
 */
export default function StatCard({
  icon, iconBg, iconColor, value, label, trend, trendLabel, accent,
}) {
  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;
  const trendColor =
    trend === 'up' ? 'var(--low)' : trend === 'down' ? 'var(--high)' : 'var(--text-muted)';

  return (
    <div
      className="stat-card fade-in-up"
      style={accent ? { borderColor: accent } : undefined}
    >
      <div
        className="stat-icon"
        style={{ background: iconBg, color: iconColor }}
      >
        {icon}
      </div>
      <div className="stat-body">
        <div className="stat-value" style={accent ? { color: iconColor } : undefined}>
          {value}
        </div>
        <div className="stat-label">{label}</div>
        {trendLabel && (
          <div className="stat-trend" style={{ color: trendColor }}>
            <TrendIcon size={13} />
            {trendLabel}
          </div>
        )}
      </div>
    </div>
  );
}
