$ErrorActionPreference = "Stop"
$repo = "C:\Users\Administrator\Documents\AAAA\48_GTApes\Grand_Theft_Apes_Website_Source"
$node = "C:\Program Files\nodejs\node.exe"
$logDir = Join-Path $repo "data\logs"
New-Item -ItemType Directory -Force -Path $logDir | Out-Null
New-Item -ItemType Directory -Force -Path (Join-Path $repo "data") | Out-Null

$listening = netstat -ano | Select-String -Pattern ":8799\s+.*LISTENING"
if ($listening) {
  Write-Host "Grand Theft Apes analytics already listening on 8799"
  exit 0
}

$env:HOST = "127.0.0.1"
$env:PORT = "8799"
$env:NODE_ENV = "production"
$env:TRUST_PROXY = "1"
$env:TRUSTED_PROXIES = "127.0.0.1,::1"
$env:TRUSTED_IP_HEADER = "x-forwarded-for"
$env:ALLOWED_ORIGINS = "https://grandtheftapes.site,https://www.grandtheftapes.site,http://grandtheftapes.site,http://www.grandtheftapes.site,https://grandtheftape.xyz,https://www.grandtheftape.xyz,http://grandtheftape.xyz,http://www.grandtheftape.xyz,https://gtapes.103.161.35.238.sslip.io,https://aaaa-web-deploy.github.io,http://127.0.0.1:8931,http://localhost:8931"
$env:GTA_DIST = $repo
$env:GTA_DATA_DIR = Join-Path $repo "data"
if (-not $env:DASHBOARD_PASSWORD) {
  $env:DASHBOARD_PASSWORD = "AAAA"
}

Start-Process -FilePath $node `
  -ArgumentList "--experimental-strip-types","server/index.ts" `
  -WorkingDirectory $repo `
  -WindowStyle Hidden `
  -RedirectStandardOutput (Join-Path $logDir "node.out.log") `
  -RedirectStandardError (Join-Path $logDir "node.err.log")

Start-Sleep -Seconds 2
$listening = netstat -ano | Select-String -Pattern ":8799\s+.*LISTENING"
if (-not $listening) {
  Write-Error "Grand Theft Apes analytics failed to start. Check data\logs\node.err.log"
  exit 1
}
Write-Host "Grand Theft Apes analytics listening on 127.0.0.1:8799"
