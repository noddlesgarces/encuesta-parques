import { randomUUID } from 'crypto'
import type { NextApiRequest, NextApiResponse } from 'next'
import { Redis } from '@upstash/redis'
import type { SurveyResponse, SurveyPayload } from '@/types'

const redis = Redis.fromEnv()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const payload: SurveyPayload = req.body

    if (!payload || !payload.answers) {
      return res.status(400).json({ error: 'Payload inválido' })
    }

    const entry: SurveyResponse = {
      id: randomUUID(),
      ts: Date.now(),
      answers: payload.answers,
    }

    await redis.lpush('responses', JSON.stringify(entry))
    return res.status(200).json({ ok: true })
  }

  if (req.method === 'GET') {
    const raw = await redis.lrange<string>('responses', 0, -1)
    const responses: SurveyResponse[] = raw.map(item =>
      typeof item === 'string' ? JSON.parse(item) : item
    )
    return res.status(200).json(responses)
  }

  res.setHeader('Allow', ['GET', 'POST'])
  res.status(405).end()
}