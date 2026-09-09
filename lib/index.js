// dsh-pair-quick host half.
// Registers ONE loopback-only HTTP route: POST /api/pair-quick/mint
//   -> POST http://127.0.0.1:<port>/api/pair/issue (remote-web-ui's mint)
//   -> QRCoDE.toDataURL(url)  -> { ok, url, expiresAt, qr }
// The browser half fetches this route directly (same-origin, loopback).
import QRCode from 'qrcode'

export const name = 'pair-quick'
export const inject = ['webServer']

export function apply(ctx) {
  const webServer = ctx.webServer

  const isLoopback = (req) => {
    const addr = req?.socket?.remoteAddress ?? ''
    return addr === '127.0.0.1' || addr === '::1' || addr === '::ffff:127.0.0.1'
  }

  const writeJson = (res, status, body) => {
    res.writeHead(status, { 'content-type': 'application/json; charset=utf-8' })
    res.end(JSON.stringify(body))
  }

  const handleMint = async (req, res) => {
    if (!isLoopback(req)) {
      writeJson(res, 403, { ok: false, code: 'forbidden' })
      return
    }
    const port = Number.isFinite(webServer.port) ? webServer.port : 3080
    try {
      const response = await fetch(`http://127.0.0.1:${String(port)}/api/pair/issue`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: '{}',
      })
      if (!response.ok) {
        writeJson(res, 502, { ok: false, error: `pair endpoint answered ${String(response.status)}` })
        return
      }
      const payload = await response.json()
      if (payload?.ok !== true || typeof payload.url !== 'string') {
        writeJson(res, 502, { ok: false, error: 'pair endpoint returned an unexpected payload' })
        return
      }
      const dataUrl = await QRCode.toDataURL(payload.url, { errorCorrectionLevel: 'M', width: 240 })
      writeJson(res, 200, { ok: true, url: payload.url, expiresAt: payload.expiresAt, qr: dataUrl })
    } catch (error) {
      writeJson(res, 500, { ok: false, error: String((error && error.message) || error) })
    }
  }

  ctx.effect(
    () => webServer.register({ kind: 'exact', path: '/api/pair-quick/mint', handler: handleMint }),
    'pair-quick: mint route',
  )
}
