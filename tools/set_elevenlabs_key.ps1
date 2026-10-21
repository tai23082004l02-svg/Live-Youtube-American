$ErrorActionPreference = 'Stop'
try {
    $projectRoot = Split-Path -Parent $PSScriptRoot
    $secretDirectory = Join-Path $projectRoot '.secrets'
    $secretFile = Join-Path $secretDirectory 'elevenlabs.key.dpapi'
    Write-Host 'Paste your NEW ElevenLabs API key, then press Enter.'
    Write-Host 'The key will not appear on screen. Do not send it in chat.'
    $secureKey = Read-Host 'API key' -AsSecureString
    if ($secureKey.Length -lt 20) { throw 'Key looks too short. Nothing was saved.' }
    New-Item -ItemType Directory -Path $secretDirectory -Force | Out-Null
    $encryptedKey = ConvertFrom-SecureString -SecureString $secureKey
    [System.IO.File]::WriteAllText($secretFile, $encryptedKey)
    $secureKey.Dispose()
    Write-Host 'Saved securely for this Windows account. You may close this window.' -ForegroundColor Green
} catch {
    Write-Host 'Setup did not complete. Try opening this setup file again.' -ForegroundColor Red
    exit 1
}
