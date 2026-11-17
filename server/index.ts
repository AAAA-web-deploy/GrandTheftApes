import { createServer } from 'node:http'
import path from 'node:path'
import { createApp } from './createApp.ts'
import { serveStatic } from './static.ts'

const dataDir = process.env.GTA_DATA_DIR ?? path.join(process.cwd(), 'data')
const dist = path.resolve(process.env.GTA_DIST ?? '.')
const port = Number(process.env.PORT ?? 8799)
const host = process.env.HOST ?? '127.0.0.1'
const trustProxy = process.env.TRUST_PROXY === '1'
const trustedProxies = (process.env.TRUSTED_PROXIES ?? '')
  .split(',')
  .map((item) => item.trim())
  .filter(Boolean)
const allowedOrigins = (
  process.env.ALLOWED_ORIGINS ??
  'https://grandtheftapes.site,https://www.grandtheftapes.site,http://grandtheftapes.site,http://www.grandtheftapes.site,https://grandtheftape.xyz,https://www.grandtheftape.xyz,http://grandtheftape.xyz,http://www.grandtheftape.xyz,https://gtapes.103.161.35.238.sslip.io,https://aaaa-web-deploy.github.io'
)
  .split(',')
  .map((item) => item.trim())
  .filter(Boolean)

const app = createApp({
  dataDir,
  nodeEnv: process.env.NODE_ENV ?? 'production',
  trustProxy,
  trustedProxies,
  trustedIpHeader: process.env.TRUSTED_IP_HEADER ?? 'x-forwarded-for',
  allowedOrigins,
})

const server = createServer((req, res) => {
  const url = req.url ?? '/'
  if (url.startsWith('/api/')) {
    void app.handle(req, res)
    return
  }
  serveStatic(req, res, dist)
})

server.on('error', () => {
  console.error('The Grand Theft Apes analytics server could not listen. Choose another PORT if this one is already in use.')
  app.close()
  process.exit(1)
})

server.listen(port, host, () => {
  console.log(`Grand Theft Apes analytics listening on http://${host}:${port}/`)
  console.log(`Dashboard: http://${host}:${port}/dashboard`)
})

for (const signal of ['SIGINT', 'SIGTERM'] as const) {
  process.on(signal, () => {
    server.close()
    app.close()
  })
}
