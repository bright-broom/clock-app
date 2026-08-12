import { ImageResponse } from 'next/og'

import { ClockGlyph } from './ClockGlyph'

export const size = {
  width: 180,
  height: 180,
}
export const contentType = 'image/png'

export default function AppleIcon() {
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '30%',
        background:
          'radial-gradient(circle at 24% 20%, rgba(255,255,255,0.28), transparent 34%), linear-gradient(150deg, #0A1324 10%, #10356A 58%, #0EA5A2 100%)',
      }}
    >
      <ClockGlyph
        canvasSize={size.width}
        minimumStroke={8}
        minimumCenterDot={14}
        minimumMarkerSize={8}
        shadow="0 8px 18px rgba(0,0,0,0.28)"
        markerOffset={3}
      />
    </div>,
    { ...size }
  )
}
