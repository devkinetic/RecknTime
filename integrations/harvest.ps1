param(
    [Parameter(Mandatory = $true)]
    [string]$FromDate,

    [Parameter(Mandatory = $true)]
    [string]$ToDate
)

$Config = (Get-Content -Raw -Path '$PSScriptRoot/../config.json' | ConvertFrom-Json).integrations.harvest
$authType = $Config.authType

if ($authType -eq "file") {
    $fileData =  Get-Content -Raw -Path "$PSScriptRoot/harvest-data/demo/$FromDate--$ToDate.json" | ConvertFrom-Json
    return $fileData.time_entries
}

$apiUrl = $Config.apiUrl
$userId = $Config.userId

$url = "https://$apiUrl/v2/"

$headers = @{
    'Harvest-Account-Id' = $userId
    'User-Agent'         = 'RecknTime'
}

if ($authType -eq "cookie") {
    # TODO
}
elseif ($authType -eq "token") {
    $token = $Config.auth.token.token
    $headers["Authorization"] = "Bearer $token"
}
else {
    throw "Unsupported authentication method: $authType"
}

try {
    $entriesUri = "$url/time_entries?from=$FromDate&to=$ToDate"
    $response = Invoke-RestMethod -Uri $entriesUri -Headers $headers -Method Get
    $data = $response.time_entries
    return $data
}
catch {
    Write-Error "Failed to fetch data from Harvest: $_"
    return @()
}
