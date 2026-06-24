import type { NextApiRequest, NextApiResponse } from 'next'
import { kv } from '@vercel/kv'
import type { SurveyResponse } from '@/types'

// Vercel KV (Redis) — persistencia real entre deployments e instancias.
// Cada respuesta se guarda como item en una lista Redis con key "responses".
// Localmente necesitas las variables de entorno KV_URL y KV_REST_API_TOKEN
// (ver README para cómo obtenerlas desde el dashboard de Vercel).

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const entry: SurveyResponse = req.body
    if (!entry || !entry.id || !entry.answers) {
      return res.status(400).json({ error: 'Payload inválido' })
    }
    // lpush agrega al inicio de la lista — el dashboard los mostrará más recientes primero
    await kv.lpush('responses', JSON.stringify(entry))
    return res.status(200).json({ ok: true })
  }

  if (req.method === 'GET') {
    // lrange 0 -1 devuelve todos los elementos de la lista
    const raw = await kv.lrange<string>('responses', 0, -1)
    const responses: SurveyResponse[] = raw.map(item =>
      typeof item === 'string' ? JSON.parse(item) : item
    )
    return res.status(200).json(responses)
  }

  res.setHeader('Allow', ['GET', 'POST'])
  res.status(405).end()
}
