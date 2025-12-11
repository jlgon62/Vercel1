// api/clearkey.js
export default function handler(req, res) {
  // CORS simple
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') return res.status(204).end()

  const channel = req.query.channel
  if (!channel) return res.status(400).json({ error: 'Missing channel param' })

  // => Rellena aquí tus canales con kid y key en HEX (sin guiones)
  const CHANNELS = {
    // ejemplo (sustituye por los tuyos):
    "sky16": {
      kidHex: "c88dc6c668cac3b468d4a4c7e176ff3d",
      keyHex: "1aeb739de2c14ed0ad658ca8043208d8"
    }
    // añade más canales: "otro": { kidHex:"...", keyHex:"..." }
  }

  const entry = CHANNELS[channel]
  if (!entry) return res.status(404).json({ error: 'Channel not found' })

  const hexToUint8 = h => {
    if (!h) return new Uint8Array()
    const bytes = new Uint8Array(h.length / 2)
    for (let i=0;i<bytes.length;i++) bytes[i] = parseInt(h.substr(i*2,2),16)
    return bytes
  }

  const base64UrlFromHex = h => {
    const bytes = hexToUint8(h)
    // Node/browser compatible: Buffer -> base64 -> base64url
    const b64 = Buffer.from(bytes).toString('base64')
    return b64.replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'')
  }

  const kid_b64url = base64UrlFromHex(entry.kidHex)
  const key_b64url = base64UrlFromHex(entry.keyHex)

  // Responder JSON en formato ClearKey
  const payload = { keys: [ { k: key_b64url, kid: kid_b64url } ] }

  res.setHeader('Content-Type','application/json')
  return res.status(200).send(JSON.stringify(payload))
}
