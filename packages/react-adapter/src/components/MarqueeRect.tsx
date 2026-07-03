interface MarqueeRectProps {
  x: number;
  y: number;
  width: number;
  height: number;
}

export function MarqueeRect({ x, y, width, height }: MarqueeRectProps) {
  return (
    <svg
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
      }}
    >
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        fill="rgba(0, 102, 255, 0.1)"
        stroke="#0066FF"
        strokeWidth={1}
        strokeDasharray="4 2"
      />
    </svg>
  );
}
