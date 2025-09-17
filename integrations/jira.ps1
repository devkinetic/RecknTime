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

$url = "https://$apiUrl/rest/api/2"

$headers = @{
    Authorization = "Bearer $token"
    Accept        = "application/json"
}

try {
    $jql = [uri]::EscapeDataString("worklogDate >= $FromDate AND worklogDate <= $ToDate AND worklogAuthor = currentUser()")
    $response = Invoke-RestMethod -Uri "$url/search?jql=$jql&fields=key,summary&maxResults=200" -Headers $headers -Method Get
    
    $allWorklogs = @{}
    foreach ($issue in $response.issues) {
        $key = $issue.key
        $summary = $issue.fields.summary
        $worklogUrl = "https://$apiUrl/rest/api/2/issue/$key/worklog"
        $logData = Invoke-RestMethod -Uri $worklogUrl -Headers $headers
        $filtered = @($logData.worklogs | Where-Object {
            $_.author.emailAddress -eq $userId -and
            ($_.started -as [datetime]) -ge ([datetime]$FromDate) -and
            ($_.started -as [datetime]) -le ([datetime]$ToDate)
        })
        $allWorklogs[$key] = @{ summary = $summary; worklogs = $filtered }
    }

    $json = $allWorklogs | ConvertTo-Json -Depth 10
    if (-not $Silent) {
        $json | Set-Content -Encoding UTF8 "jira.json"
        Write-Host "Worklogs saved to jira.json"
    }
    
    return $json
}
catch {
    Write-Error "Failed to fetch data from Jira: $_"
    return @()
}
