// api/clearkey.js
function hexToBase64Url(hex) {
  const bytes = Buffer.from(hex.replace(/[^0-9a-fA-F]/g, ''), 'hex')
  const b64 = bytes.toString('base64')
  return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

// Map channels -> { kidHex, keyHex }
const CHANNELS = {
  // ejemplo con el que nos diste
  'sky16': {
    kid: 'c88dc6c668cac3b468d4a4c7e176ff3d',
    key: '1aeb739de2c14ed0ad658ca8043208d8'
  },
  // añade otros canales aquí...
}

export default function handler(req, res) {
  const ch = (req.query.channel || '').toLowerCase()
  const entry = CHANNELS[ch]
  if (!entry) {
    return res.status(404).json({ error: 'Unknown channel' })
  }

  const kid_b64 = hexToBase64Url(entry.kid)
  const key_b64 = hexToBase64Url(entry.key)

  // formato JWK-like que ExoPlayer suele aceptar para ClearKey
  const body = {
    keys: [
      { kid: kid_b64, k: key_b64 }
    ]
  }

  res.setHeader('Content-Type', 'application/json')
  res.setHeader('Access-Control-Allow-Origin', '*')
  return res.status(200).json(body)
}
