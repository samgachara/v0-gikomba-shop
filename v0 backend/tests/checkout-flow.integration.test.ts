import { describe, expect, it, vi } from 'vitest'

const rpcMock = vi.fn()
const selectMock = vi.fn().mockReturnThis()
const eqMock = vi.fn().mockReturnThis()
const singleMock = vi.fn()

vi.mock('@/lib/supabase/server', () => ({
  createClient: async () => ({
    rpc: rpcMock,
    from: () => ({
      select: selectMock,
      eq: eqMock,
      single: singleMock,
    }),
  }),
}))

describe('checkout flow integration', () => {
  it('creates order via atomic RPC and returns data', async () => {
    rpcMock.mockResolvedValueOnce({
      data: { id: '9d33c85c-2d3f-4ee2-8155-6914e4664ffd', total: 1200 },
      error: null,
    })

    const { createOrderAtomic } = await import('@/lib/services/order-service')
    const result = await createOrderAtomic({
      userId: '45e81201-c1a1-4671-b945-5afc3f53d7fd',
      shipping_address: 'Moi Avenue',
      shipping_city: 'Nairobi',
      phone: '+254700000000',
      payment_method: 'mpesa',
    })

    expect('data' in result).toBe(true)
    if ('data' in result) {
      expect(result.data.id).toBeDefined()
    }
  })
})
