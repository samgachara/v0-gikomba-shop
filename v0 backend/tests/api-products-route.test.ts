import { describe, expect, it, vi } from 'vitest'

const mockQuery = {
  select: vi.fn().mockReturnThis(),
  order: vi.fn().mockReturnThis(),
  range: vi.fn().mockReturnThis(),
  eq: vi.fn().mockReturnThis(),
  or: vi.fn().mockReturnThis(),
}

vi.mock('@/lib/supabase/server', () => ({
  createClient: async () => ({
    from: () => ({
      ...mockQuery,
      then: undefined,
    }),
  }),
}))

describe('products route query validation', () => {
  it('rejects invalid limit', async () => {
    const { GET } = await import('@/app/api/products/route')
    const request = {
      nextUrl: new URL('http://localhost/api/products?limit=5000'),
    }
    const response = await GET(request as never)
    const json = await response.json()
    expect(response.status).toBe(400)
    expect(json.success).toBe(false)
  })
})
