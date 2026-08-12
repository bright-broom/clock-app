import { ImageResponse } from 'next/og'

export const size = {
  width: 1200,
  height: 630,
}
export const contentType = 'image/png'
export const alt = 'Clock - Minimal clock with golden ratio aesthetics'

export default function OpenGraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background:
          'radial-gradient(circle at 28% 18%, rgba(255,255,255,0.22), transparent 36%), linear-gradient(145deg, #081326 8%, #11396f 56%, #0f8f89 100%)',
      }}
    >
      <div
        style={{
          width: 280,
          height: 280,
          borderRadius: 999,
          border: '20px solid rgba(255,255,255,0.92)',
          background: 'rgba(255,255,255,0.08)',
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 16px 28px rgba(0,0,0,0.26)',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: 20,
            width: 20,
            height: 20,
            borderRadius: 999,
            backgroundColor: '#FFFFFF',
            opacity: 0.95,
          }}
        />
        <div
          style={{
            position: 'absolute',
            width: 16,
            height: 90,
            borderRadius: 999,
            backgroundColor: '#FFFFFF',
            transform: 'translateY(-14%) rotate(18deg)',
            transformOrigin: 'bottom center',
          }}
        />
        <div
          style={{
            position: 'absolute',
            width: 16,
            height: 70,
            borderRadius: 999,
            backgroundColor: '#CCFBF1',
            transform: 'translate(18%, 7%) rotate(106deg)',
            transformOrigin: 'bottom center',
          }}
        />
        <div
          style={{
            width: 34,
            height: 34,
            borderRadius: 999,
            backgroundColor: '#FFFFFF',
          }}
        />
      </div>
    </div>,
    { ...size }
  )
}
