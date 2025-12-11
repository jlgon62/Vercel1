// api/proxy.js
export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-proxy-origin-headers')
    return res.status(204).end()
  }

  const target = req.query.url || req.body?.url
  if (!target) return res.status(400).json({ error: 'Missing url query parameter' })

  // allow overriding UA via ?ua=... (encoded)
  const uaQuery = req.query.ua
  const defaultUA = 'Mozilla/5.0 (X11; Linux armv7l) AppleWebKit/537.36 (KHTML, like Gecko) QtWebEngine/5.9.7 Chrome/56.0.2924.122 Safari/537.36 Sky_STB_ST412_2018/1.0.0 (Sky, EM150UK, )'
  const chosenUA = uaQuery ? decodeURIComponent(uaQuery) : defaultUA

  try {
    const headers = {
      'User-Agent': chosenUA,
      // override/add any fixed headers you want here:
      // 'Origin': 'https://example.com',
      // 'Referer': 'https://example.com/',
      ...(
        req.headers['x-proxy-origin-headers']
          ? JSON.parse(req.headers['x-proxy-origin-headers'])
          : {}
      )
    }

    const fetchRes = await fetch(target, { method: 'GET', headers, redirect: 'follow' })

    const contentType = fetchRes.headers.get('content-type') || 'application/octet-stream'
    res.setHeader('Content-Type', contentType)
    res.setHeader('Access-Control-Allow-Origin', '*')

    const body = await fetchRes.arrayBuffer()
    res.status(fetchRes.status).send(Buffer.from(body))
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Proxy error', detail: String(err) })
  }
}
