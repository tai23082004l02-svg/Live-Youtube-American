param(
    [ValidateSet('Voices','Sample','AutoSample','JapaneseSample')][string]$Mode = 'Voices',
    [string]$VoiceId = ''
)
$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
$headers = @{}
$stage = 'local key decryption'
try {
    $encrypted = [System.IO.File]::ReadAllText((Join-Path $root '.secrets\elevenlabs.key.dpapi'))
    $secure = ConvertTo-SecureString $encrypted
    $pointer = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($secure)
    try { $headers['xi-api-key'] = [System.Runtime.InteropServices.Marshal]::PtrToStringBSTR($pointer) }
    finally { [System.Runtime.InteropServices.Marshal]::ZeroFreeBSTR($pointer); $secure.Dispose() }
    $stage = 'API connection'
    if ($Mode -eq 'Voices') {
        $response = Invoke-RestMethod -Uri 'https://api.elevenlabs.io/v1/voices' -Headers $headers -TimeoutSec 25
        $response.voices | ForEach-Object { [PSCustomObject]@{name=$_.name;voice_id=$_.voice_id;labels=$_.labels;category=$_.category} } | ConvertTo-Json -Depth 4
    } else {
        if ($Mode -eq 'JapaneseSample') {
            $voices = (Invoke-RestMethod -Uri 'https://api.elevenlabs.io/v1/voices' -Headers $headers -TimeoutSec 25).voices
            $candidates = @($voices | Where-Object {
                $v = $_
                $japanese = $v.labels.language -match '^(ja|japanese)$' -or $v.labels.accent -match 'japanese' -or @($v.verified_languages | Where-Object { $_.language -eq 'ja' -or $_.locale -match '^ja' }).Count -gt 0 -or $v.name -match '^(Asahi|Otani|Ken)(?:\s|$|-)'
                $japanese -and ($v.labels.gender -eq 'male' -or $v.name -match '^(Asahi|Otani|Ken)(?:\s|$|-)')
            })
            $selected = $candidates | Sort-Object @{Expression={ if (($_.description+' '+$_.name) -match 'energetic|powerful|anime|dynamic|character|strong') {0} else {1} }} | Select-Object -First 1
            if (-not $selected) {
                Write-Output 'No Japanese male voice found in your available voices. No generation credit spent.'
                Write-Output 'Open ElevenLabs > Voices > Explore. Filter Japanese + Male, add a powerful/character voice to My Voices, then run this file again.'
                exit 2
            }
            $VoiceId = $selected.voice_id
            Write-Output ('Selected Japanese voice: '+$selected.name)
        }
        if ($Mode -eq 'AutoSample') {
            $voices = (Invoke-RestMethod -Uri 'https://api.elevenlabs.io/v1/voices' -Headers $headers -TimeoutSec 25).voices
            $selected = $voices | Where-Object { $_.name -match '^Adam(?:\s|$|-)' } | Select-Object -First 1
            if (-not $selected) { $selected = $voices | Where-Object { $_.name -match '^Brian(?:\s|$|-)' } | Select-Object -First 1 }
            if (-not $selected) { $selected = $voices | Where-Object { $_.labels.gender -eq 'male' -and $_.category -eq 'premade' } | Select-Object -First 1 }
            if (-not $selected) { throw 'No suitable existing voice found.' }
            $VoiceId = $selected.voice_id
            Write-Output ('Selected voice: '+$selected.name)
        }
        if ($VoiceId -notmatch '^[A-Za-z0-9_-]+$') { throw 'Invalid voice selection.' }
        $outDirectory = Join-Path $root 'art\audio\elevenlabs'
        New-Item -ItemType Directory -Path $outDirectory -Force | Out-Null
        $fileName = if ($Mode -eq 'JapaneseSample') {'goku_kamehameha_japanese_raw.mp3'} else {'goku_kamehameha_sample_raw.mp3'}
        $outFile = Join-Path $outDirectory $fileName
        if (Test-Path -LiteralPath $outFile) { throw 'Sample already exists. Refusing to spend more credits by overwriting.' }
        $text = '[determined] Ka... me... ha... me... [shouting] HAAAAAA!'
        if ($Mode -eq 'JapaneseSample') { $text = '[serious] か……め……は……め……[shouting] 波ああああっ！！' }
        $payload = @{text=$text;model_id='eleven_v3';voice_settings=@{stability=0.5;similarity_boost=0.75}}
        if ($Mode -eq 'JapaneseSample') { $payload.language_code = 'ja' }
        $body = [System.Text.Encoding]::UTF8.GetBytes(($payload | ConvertTo-Json -Depth 3))
        # Exactly one request; no automatic retry on generation/timeout.
        Invoke-WebRequest -UseBasicParsing -Uri ('https://api.elevenlabs.io/v1/text-to-speech/'+$VoiceId+'?output_format=mp3_44100_128') -Method Post -ContentType 'application/json' -Headers $headers -Body $body -TimeoutSec 90 -OutFile $outFile | Out-Null
        Write-Output ('Sample saved to art/audio/elevenlabs/'+$fileName)
        Write-Output ('Submitted characters: '+$text.Length)
    }
} catch {
    $status = if ($_.Exception.Response) { [int]$_.Exception.Response.StatusCode } else { 'connection/local setup' }
    Write-Output ('ElevenLabs request did not complete. Stage: '+$stage+'; status: '+$status+'; error type: '+$_.Exception.GetType().Name)
    exit 1
} finally {
    $headers.Clear()
}
