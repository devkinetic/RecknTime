param(
    [Parameter(Mandatory = $true)]
    [pscustomobject]$Config,

    [Parameter(Mandatory = $true)]
    [string]$FromDate,

    [Parameter(Mandatory = $true)]
    [string]$ToDate,
    
    [switch]$Silent
)

$token  = $Config.token
$apiUrl = $Config.apiUrl
$userId = $Config.userId

$url = "https://$apiUrl/v2/"

$headers = @{
    Authorization        = "Bearer $token"
    'Harvest-Account-Id' = $userId
    'User-Agent'         = 'Recon'
}

try {
    $response = Invoke-RestMethod -Uri "$url/time_entries?from=$FromDate&to=$ToDate" -Headers $headers -Method Get
    $data = $response.time_entries
    if (-not $Silent) {
        $data | ConvertTo-Json -Depth 10 | Set-Content -Encoding UTF8 "harvest.json"
        Write-Host "Harvest Entries saved to harvest.json"
    }
    return $data
}
catch {
    Write-Error "Failed to fetch data from Harvest: $_"
    return @()
}