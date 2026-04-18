import useSWR from 'swr'
import type { Order } from '@/lib/types'

const fetcher = (url: string) =>
  fetch(url)
    .then((r) => r.json())
    .then((j) => (j.success ? (j.data as Order[]) : []))

export function useOrders() {
  const { data, error, isLoading, mutate } = useSWR<Order[]>('/api/orders', fetcher, {
    // Orders don't change frequently — cache for 60 seconds
    dedupingInterval: 60_000,
    revalidateOnFocus: false,
  })

  return {
    orders: data ?? [],
    isLoading,
    error,
    mutate,
  }
}
