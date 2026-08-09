import { useEffect, useRef } from 'react';

export default function ProgressRing({
  progress = 0,
  size = 120,
  strokeWidth = 8,
  label = '',
  sublabel = '',
  color,
  className = '',
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - Math.min(1, Math.max(0, progress)));
  const circleRef = useRef(null);

  useEffect(() => {
    if (circleRef.current) {
      circleRef.current.style.strokeDashoffset = offset;
    }
  }, [offset]);

  return (
    <div className={`relative ${className}`} style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        style={{ transform: 'rotate(-90deg)' }}
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--bg-tertiary)"
          strokeWidth={strokeWidth}
        />
        <circle
          ref={circleRef}
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color || 'var(--accent)'}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={circumference}
          strokeLinecap="round"
          style={{
            transition: 'stroke-dashoffset 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)',
            filter: `drop-shadow(0 0 6px ${color || 'var(--accent)'})`,
          }}
        />
      </svg>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {label && (
          <span
            style={{
              fontSize: size * 0.22,
              fontWeight: 800,
              color: 'var(--text-primary)',
              fontVariantNumeric: 'tabular-nums',
              lineHeight: 1,
            }}
          >
            {label}
          </span>
        )}
        {sublabel && (
          <span
            style={{
              fontSize: size * 0.1,
              color: 'var(--text-muted)',
              marginTop: 4,
            }}
          >
            {sublabel}
          </span>
        )}
      </div>
    </div>
  );
}
