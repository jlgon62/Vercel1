export default function handler(req, res) {
  const channel = req.query.channel;

  if (!channel) {
    return res.status(400).json({ error: "Missing ?channel=name parameter" });
  }

  // 🔹 AQUI ES DONDE VAN TUS KID Y KEY
  const CHANNELS = {
    "sky16": {
      kidHex: "c88dc6c668cac3b468d4a4c7e176ff3d",
      keyHex: "1aeb739de2c14ed0ad658ca8043208d8"
    }
  };

  const data = CHANNELS[channel];

  if (!data) {
    return res.status(404).json({ error: "Channel not found" });
  }

  // Convertir hex a base64
  const hexToBase64 = hex =>
    Buffer.from(hex.replace(/-/g, ""), "hex").toString("base64");

  const clearkey = {
    keys: [
      {
        kty: "oct",
        kid: hexToBase64(data.kidHex),
        k: hexToBase64(data.keyHex)
      }
    ],
    type: "temporary"
  };

  res.setHeader("Content-Type", "application/json");
  return res.status(200).json(clearkey);
}
