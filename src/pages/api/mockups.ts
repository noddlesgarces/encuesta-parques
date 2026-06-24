import type { NextApiRequest, NextApiResponse } from 'next'
import { list, put } from '@vercel/blob'

export const config = {
  api: { bodyParser: false },
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // GET — lista todos los mockups subidos
  if (req.method === 'GET') {
    const { blobs } = await list({ prefix: 'mockups/' })
    const mockups = blobs.map(b => ({
      url: b.url,
      name: b.pathname.replace('mockups/', ''),
    }))
    return res.status(200).json({ mockups })
  }

  // POST — sube una imagen nueva
  // Uso: fetch('/api/mockups', { method: 'POST', headers: { 'x-filename': 'nombre.png' }, body: fileBlob })
  if (req.method === 'POST') {
    const filename = req.headers['x-filename'] as string
    if (!filename) return res.status(400).json({ error: 'Falta x-filename en headers' })

    const blob = await put(`mockups/${filename}`, req, {
      access: 'public',
      contentType: req.headers['content-type'] || 'image/png',
    })

    return res.status(200).json({ url: blob.url, name: filename })
  }

  res.setHeader('Allow', ['GET', 'POST'])
  res.status(405).end()
}