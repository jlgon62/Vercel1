// api/proxy.js
export default async function handler(req, res) {
  // Soporte CORS simple
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    return res.status(204).end()
  }

  const target = req.query.url || req.body?.url
  if (!target) return res.status(400).json({ error: 'Missing url query parameter' })

  try {
    // Construye headers personalizados (modifica si necesitas otros)
    const headers = {
      'User-Agent': req.headers['user-agent'] || 'Mozilla/5.0',
      // Si necesitas Origin/Referer o token fijos, ponlos aquí:
      // 'Origin': 'https://example.com',
      // 'Referer': 'https://example.com/',
      // 'Authorization': 'Bearer XXX',
      // Copiamos el resto de headers prácticos si vienen del cliente:
      ...(
        req.headers['x-proxy-origin-headers']
          ? JSON.parse(req.headers['x-proxy-origin-headers'])
          : {}
      )
    }

    const fetchRes = await fetch(target, { method: 'GET', headers, redirect: 'follow' })

    // Copiamos algunos headers útiles de la respuesta original
    const contentType = fetchRes.headers.get('content-type') || 'application/octet-stream'
    res.setHeader('Content-Type', contentType)
    // permitir acceso desde cualquier origen (ajusta si quieres restringir)
    res.setHeader('Access-Control-Allow-Origin', '*')

    // Stream de la respuesta al cliente
    const body = await fetchRes.arrayBuffer()
    res.status(fetchRes.status).send(Buffer.from(body))
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Proxy error', detail: String(err) })
  }
}
