Import-Module Pode

Start-PodeServer {
    Add-PodeEndpoint -Address localhost -Port 8081 -Protocol Http
    
    Set-PodeState -Name 'AppConfig' -Value (Get-Content -Raw -Path 'config.json' | ConvertFrom-Json)
    
    Add-PodeRoute -Method Get -Path '/config.js' -ScriptBlock {
        $config = Get-PodeState -Name 'AppConfig'
        
        $combined = @{
            jiraDomain = $config.integrations.jira.domain
            harvestDomain = $config.integrations.harvest.domain
            projectAliases = $config.projectAliases
        }
        
        $json = $combined | ConvertTo-Json -Compress
        $js = "window.AppConfig = $json;"
        Write-PodeTextResponse -Value $js -ContentType 'application/javascript'
    }

    Add-PodeRoute -Method Get -Path '/' -ScriptBlock {
        Write-PodeViewResponse -Path 'index'
    }
    
    Add-PodeRoute -Method Get -Path '/api/entries' -ScriptBlock {
        $config = Get-PodeState -Name 'AppConfig'
        $fromDate = $WebEvent.Query['fromDate']
        $toDate = $WebEvent.Query['toDate']
        
        if (-not $fromDate -or -not $toDate ) {
            Set-PodeResponseStatus -Code 400
            Write-PodeJsonResponse -Value @{ error = "Missing required query parameters" }
            return
        }
        
        $jiraArgs = @{
            Config = $config.integrations.jira
            FromDate = $fromDate
            ToDate = $toDate
            Silent = $true
        }
        
        $harvestArgs = @{
            Config = $config.integrations.harvest
            FromDate = $fromDate
            ToDate = $toDate
            Silent = $true
        }

        try {
            $jiraJson = & "$PSScriptRoot/integrations/jira.ps1" @jiraArgs
            $harvestJson = & "$PSScriptRoot/integrations/harvest.ps1" @harvestArgs
        }
        catch {
            Write-Host "Error in script:"
            Write-Host $_
            Set-PodeResponseStatus -Code 500
            Write-PodeJsonResponse -Value @{ error = "Jira script failed: $($_.Exception.Message)" }
            return
        }
        
        $jiraParsed = $jiraJson | ConvertFrom-Json

        $combined = @{
            jira    = $jiraParsed
            harvest = $harvestJson
        }

        Write-PodeJsonResponse -Value $combined
    }
}
