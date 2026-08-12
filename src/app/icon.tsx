import { ImageResponse } from 'next/og'

import { ClockGlyph } from './ClockGlyph'

export const size = {
  width: 32,
  height: 32,
}
export const contentType = 'image/png'

export default function Icon() {
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
        minimumStroke={2}
        minimumCenterDot={3}
        minimumMarkerSize={2}
        shadow="0 2px 5px rgba(0,0,0,0.28)"
        markerOffset={1}
      />
    </div>,
    { ...size }
  )
}
