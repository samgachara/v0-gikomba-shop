import { ZodTypeAny } from 'zod'
import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { checkRateLimit } from './rate-limit'
import { fail } from './response'

type HandlerContext<TBody> = {
  request: NextRequest
  userId?: string
  body: TBody
}

type HandlerOptions<TSchema extends ZodTypeAny | undefined> = {
  requireAuth?: boolean
  schema?: TSchema
  rateLimit?: {
    maxRequests: number
    windowMs: number
  }
}

type ParsedBody<TSchema extends ZodTypeAny | undefined> = TSchema extends ZodTypeAny
  ? TSchema['_output']
  : undefined

export function withApiHandler<TSchema extends ZodTypeAny | undefined>(
  fn: (ctx: HandlerContext<ParsedBody<TSchema>>) => Promise<Response>,
  options?: HandlerOptions<TSchema>,
) {
  return async (request: NextRequest) => {
    try {
      const forwardedFor = request.headers.get('x-forwarded-for') ?? 'unknown'
      const key = `${forwardedFor}:${request.nextUrl.pathname}:${request.method}`
      const limitCfg = options?.rateLimit ?? { maxRequests: 80, windowMs: 60_000 }
      const limit = checkRateLimit(key, limitCfg.maxRequests, limitCfg.windowMs)
      if (!limit.allowed) {
        return fail('Too many requests. Please try again later.', 429)
      }

      const supabase = await createClient()
      let userId: string | undefined

      if (options?.requireAuth) {
        const {
          data: { user },
        } = await supabase.auth.getUser()
        if (!user) {
          return fail('Unauthorized', 401)
        }
        userId = user.id
      }

      let body: ParsedBody<TSchema> = undefined as ParsedBody<TSchema>
      if (options?.schema) {
        const json = await request.json()
        const parsed = options.schema.safeParse(json)
        if (!parsed.success) {
          return fail('Invalid request payload', 400)
        }
        body = parsed.data as ParsedBody<TSchema>
      }

      return await fn({ request, userId, body })
    } catch {
      return fail('Internal server error', 500)
    }
  }
}
