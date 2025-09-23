param(
    [Parameter(Mandatory = $true)]
    [string]$FromDate,
    
    [Parameter(Mandatory = $true)]
    [string]$ToDate
)

$Config = (Get-Content -Raw -Path '$PSScriptRoot/../config.json' | ConvertFrom-Json).integrations.jira
$authType = $Config.authType

if ($authType -eq "file") {
    return Get-Content -Raw -Path "$PSScriptRoot/jira-data/demo/$FromDate--$ToDate.json" | ConvertFrom-Json
}

$apiUrl = $Config.apiUrl
$userId = $Config.userId

$url = "https://$apiUrl/rest/api/2"

$headers = @{
    Accept = "application/json"
}

if ($authType -eq "cookie") {
    $jsessionId = $Config.auth.cookie.jsessionId
    $xsrfToken = $Config.auth.cookie.xsrfToken
    $cookieHeader = "JSESSIONID=$jsessionId; atlassian.xsrf.token=$xsrfToken"
    $headers["Cookie"] = $cookieHeader
    $headers["X-Atlassian-Token"] = "no-check"
    $headers["User-Agent"] = "Mozilla/5.0"
}
elseif ($authType -eq "token") {
    $token = $Config.auth.token.token
    $headers["Authorization"] = "Bearer $token"
}
else {
    throw "Unsupported authentication method: $authType"
}

try {
    $searchIssuesJql = [uri]::EscapeDataString("worklogDate >= $FromDate AND worklogDate <= $ToDate AND worklogAuthor = currentUser()")
    $searchUri = "$url/search?jql=$searchIssuesJql&fields=key,summary&maxResults=200"
    
    $response = Invoke-RestMethod -Uri $searchUri -Headers $headers -Method Get
    
    $allWorklogs = @{}
    foreach ($issue in $response.issues) {
        $key = $issue.key
        $summary = $issue.fields.summary
        $worklogUrl = "$url/issue/$key/worklog"
        $logData = Invoke-RestMethod -Uri $worklogUrl -Headers $headers
        $filtered = @($logData.worklogs | Where-Object {
            $_.author.emailAddress -eq $userId -and
            ($_.started -as [datetime]) -ge ([datetime]$FromDate) -and
            ($_.started -as [datetime]) -le ([datetime]$ToDate)
        })
        $allWorklogs[$key] = @{ summary = $summary; worklogs = $filtered }
    }
    return $allWorklogs
}
catch {
    Write-Error "Failed to fetch data from Jira: $_"
    return @()
}
