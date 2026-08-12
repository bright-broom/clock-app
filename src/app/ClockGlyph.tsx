type ClockGlyphProps = {
  canvasSize: number
  minimumStroke: number
  minimumCenterDot: number
  minimumMarkerSize: number
  shadow: string
  markerOffset: number
}

export function ClockGlyph({
  canvasSize,
  minimumStroke,
  minimumCenterDot,
  minimumMarkerSize,
  shadow,
  markerOffset,
}: ClockGlyphProps) {
  const dialSize = canvasSize * 0.7
  const ringWidth = Math.max(minimumStroke, Math.round(canvasSize * 0.085))
  const handWidth = Math.max(minimumStroke, Math.round(canvasSize * 0.08))
  const centerDot = Math.max(minimumCenterDot, Math.round(canvasSize * 0.12))
  const markerSize = Math.max(minimumMarkerSize, Math.round(canvasSize * 0.06))

  return (
    <div
      style={{
        width: dialSize,
        height: dialSize,
        borderRadius: '999px',
        border: `${ringWidth}px solid rgba(255, 255, 255, 0.92)`,
        background: 'rgba(255, 255, 255, 0.06)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        boxShadow: shadow,
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: ringWidth - markerOffset,
          width: markerSize,
          height: markerSize,
          borderRadius: 999,
          backgroundColor: '#FFFFFF',
          opacity: 0.95,
        }}
      />
      <div
        style={{
          position: 'absolute',
          width: handWidth,
          height: dialSize * 0.31,
          backgroundColor: '#FFFFFF',
          borderRadius: 999,
          transform: 'translateY(-14%) rotate(18deg)',
          transformOrigin: 'bottom center',
        }}
      />
      <div
        style={{
          position: 'absolute',
          width: handWidth,
          height: dialSize * 0.24,
          backgroundColor: '#CCFBF1',
          borderRadius: 999,
          transform: 'translate(18%, 7%) rotate(106deg)',
          transformOrigin: 'bottom center',
        }}
      />
      <div
        style={{
          width: centerDot,
          height: centerDot,
          borderRadius: '999px',
          backgroundColor: '#FFFFFF',
        }}
      />
    </div>
  )
}
