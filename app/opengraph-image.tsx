import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = "Gikomba Shop – Kenya's Favorite Online Marketplace"
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'sans-serif',
          padding: '60px',
        }}
      >
        {/* Logo circle */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 100,
          height: 100,
          borderRadius: '50%',
          background: '#e11d48',
          marginBottom: 32,
        }}>
          <span style={{ fontSize: 56, fontWeight: 900, color: 'white' }}>G</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 20 }}>
          <span style={{ fontSize: 64, fontWeight: 900, color: 'white' }}>gikomba</span>
          <span style={{ fontSize: 64, fontWeight: 900, color: '#e11d48' }}>.shop</span>
        </div>

        <p style={{ fontSize: 28, color: 'rgba(255,255,255,0.8)', textAlign: 'center', margin: 0 }}>
          Kenya's Favorite Online Marketplace
        </p>

        <div style={{
          display: 'flex',
          gap: 32,
          marginTop: 48,
        }}>
          {['M-Pesa Payments', 'Fast Delivery', 'Quality Products'].map((item) => (
            <div key={item} style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              background: 'rgba(255,255,255,0.1)',
              borderRadius: 24,
              padding: '10px 20px',
            }}>
              <span style={{ color: '#e11d48', fontSize: 18 }}>✓</span>
              <span style={{ color: 'white', fontSize: 18 }}>{item}</span>
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size }
  )
}
