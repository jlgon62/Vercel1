// api/proxy.js
export default async function handler(req, res) {
  // CORS simple
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    return res.status(204).end()
  }

  const target = req.query.url || req.body?.url
  if (!target) return res.status(400).json({ error: 'Missing url query parameter' })

  // Valores que puedes forzar desde la URL:
  // ?ua=...  &origin=... &referer=...
  const forcedUA = req.query.ua || req.body?.ua || 'Mozilla/5.0 (X11; Linux armv7l) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/56.0.2924.122 Safari/537.36 Sky_STB'
  const forcedOrigin = req.query.origin || req.body?.origin
  const forcedReferer = req.query.referer || req.body?.referer

  try {
    const headers = {
      // Forzamos el user-agent (importante)
      'User-Agent': forcedUA,
      // Copiamos headers que el cliente quiera pasar (opcional)
      ...(
        req.headers['x-proxy-origin-headers']
          ? JSON.parse(req.headers['x-proxy-origin-headers'])
          : {}
      )
    }
    if (forcedOrigin) headers['Origin'] = forcedOrigin
    if (forcedReferer) headers['Referer'] = forcedReferer

    const fetchRes = await fetch(target, { method: 'GET', headers, redirect: 'follow' })

    // Si el servidor remoto devuelve 4xx/5xx, forwardea el código y el body (texto)
    if (!fetchRes.ok) {
      const text = await fetchRes.text().catch(() => null)
      res.setHeader('Access-Control-Allow-Origin', '*')
      return res.status(fetchRes.status).send(text || `Upstream returned ${fetchRes.status}`)
    }

    // Detectamos content-type para devolver texto/XML en vez de "download"
    const contentType = fetchRes.headers.get('content-type') || 'application/octet-stream'
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Content-Type', contentType)

    // Si es texto/xml/json devolvemos texto (evita que el navegador descargue el archivo)
    if (/^(text\/|application\/(xml|json)|.*\+xml)/i.test(contentType)) {
      const text = await fetchRes.text()
      return res.status(fetchRes.status).send(text)
    }

    // Si no es texto, devolvemos como arraybuffer (stream)
    const buffer = Buffer.from(await fetchRes.arrayBuffer())
    res.status(fetchRes.status).send(buffer)
  } catch (err) {
    console.error('Proxy error:', err)
    res.status(500).json({ error: 'Proxy error', detail: String(err) })
  }
}
