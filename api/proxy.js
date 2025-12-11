export default async function handler(req, res) {
  const target = req.query.url;
  if (!target) return res.status(400).send("missing url");

  const UA = "Mozilla/5.0 (X11; Linux armv7l) AppleWebKit/537.36 (KHTML, like Gecko) QtWebEngine/5.9.7 Chrome/56.0.2924.122 Safari/537.36 Sky_STB_ST412_2018/1.0.0 (Sky, EM150UK, )";

  const r = await fetch(target, {
    headers: { "User-Agent": UA }
  });

  const data = await r.arrayBuffer();
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Content-Type", r.headers.get("content-type") || "application/octet-stream");
  res.status(r.status).send(Buffer.from(data));
}
