$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
$homeDirectory = Join-Path $root '.voice-worker'
New-Item -ItemType Directory -Force -Path $homeDirectory | Out-Null
$statusFile = Join-Path $homeDirectory 'status.json'
if (Test-Path -LiteralPath $statusFile) {
    try {
        $status = Get-Content -Raw -LiteralPath $statusFile | ConvertFrom-Json
        $now = [DateTimeOffset]::UtcNow.ToUnixTimeSeconds()
        if ($status.status -eq 'running' -and ($now - $status.heartbeat) -lt 12) {
            Write-Host 'Voice worker is already running. You can close this window.'
            exit 0
        }
    } catch {}
}
if (-not (Test-Path -LiteralPath (Join-Path $root '.secrets\elevenlabs.key.dpapi'))) {
    Write-Host 'Run Setup_ElevenLabs.cmd first.'
    exit 1
}
$pythonCommand = Get-Command python.exe -ErrorAction SilentlyContinue
if (-not $pythonCommand) { Write-Host 'Python was not found.'; exit 1 }
$scriptFile = Join-Path $PSScriptRoot 'voice_worker.py'
Start-Process -FilePath $pythonCommand.Source -ArgumentList @('-u', ('"'+$scriptFile+'"')) -WorkingDirectory $root -WindowStyle Hidden -RedirectStandardOutput (Join-Path $homeDirectory 'worker.stdout.log') -RedirectStandardError (Join-Path $homeDirectory 'worker.stderr.log') | Out-Null
Write-Host 'Voice worker launched in background. No console needs to stay open.' -ForegroundColor Green
Write-Host 'Limits: 200 characters/job, 1000 characters/day, 10 samples/day.'
Write-Host 'Use Stop_Voice_Worker.cmd to stop after the current request.'
