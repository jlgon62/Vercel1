// api/clearkey.js
// Simple license responder para Clearkey: ?channel=sky16
const CHANNELS = {
  "sky16": {
    kidHex: "c88dc6c668cac3b468d4a4c7e176ff3d",
    keyHex: "1aeb739de2c14ed0ad658ca8043208d8"
  }
}

function hexToBase64(hex) {
  const bytes = Buffer.from(hex.replace(/[^0-9a-f]/gi, ''), 'hex')
  return bytes.toString('base64')
}

export default function handler(req, res) {
  const name = (req.query.channel || '').toLowerCase()
  const ch = CHANNELS[name]
  if (!ch) return res.status(404).json({ error: 'Channel not found' })

  const kid_b64 = hexToBase64(ch.kidHex)
  const key_b64 = hexToBase64(ch.keyHex)

  const body = {
    keys: [{ kty: 'oct', kid: kid_b64, k: key_b64 }],
    type: 'temporary'
  }

  res.setHeader('Content-Type', 'application/json')
  res.setHeader('Access-Control-Allow-Origin', '*')
  return res.status(200).send(JSON.stringify(body))
}
