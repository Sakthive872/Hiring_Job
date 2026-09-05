# Improved API smoke test script
$baseUrl = $env:API_URL
if (-not $baseUrl -or $baseUrl -eq '') { $baseUrl = 'http://localhost:8080/api/v1' }
$maxAttempts = 3
$delaySeconds = 2

function Invoke-Json($method, $url, $body = $null, $token = $null) {
    try {
        $headers = @{ 'Content-Type' = 'application/json' }
        if ($token) { $headers['Authorization'] = "Bearer $token" }
        if ($body -ne $null) {
            $json = $body | ConvertTo-Json -Depth 10
            return Invoke-RestMethod -Method $method -Uri $url -Body $json -Headers $headers -ErrorAction Stop
        } else {
            return Invoke-RestMethod -Method $method -Uri $url -Headers $headers -ErrorAction Stop
        }
    } catch {
        return @{ error = $_.Exception.Message; response = $_.Exception.Response }
    }
}

Write-Host "Base URL: $baseUrl"

$users = @(
    @{ username = 'alice'; email = 'alice+test2@example.com'; password = 'Password1!'; role = 'candidate' },
    @{ username = 'bob'; email = 'bob+test2@example.com'; password = 'Password1!'; role = 'candidate' },
    @{ username = 'carol'; email = 'carol+test2@example.com'; password = 'Password1!'; role = 'candidate' },
    @{ username = 'hr1'; email = 'hr1+test2@example.com'; password = 'Password1!'; role = 'recruiter' },
    @{ username = 'hr2'; email = 'hr2+test2@example.com'; password = 'Password1!'; role = 'recruiter' }
)

$created = @()
foreach ($u in $users) {
    $attempt = 0
    $registered = $false
    while ($attempt -lt $maxAttempts -and -not $registered) {
        $attempt++
        Write-Host "Registering $($u.email) (attempt $attempt)"
        $resp = Invoke-Json -method Post -url "$baseUrl/auth/register" -body @{ username = $u.username; email = $u.email; password = $u.password; role = $u.role }
        if ($resp -is [System.Management.Automation.PSCustomObject] -and $resp.success -eq $true) {
            $token = $resp.data.accessToken
            $userId = $resp.data.user.id
            Write-Host "Registered: $($u.email) id=$userId"
            $created += @{ email = $u.email; id = $userId; token = $token; username = $u.username; role = $u.role }
            $registered = $true
            break
        } else {
            $err = if ($resp.error) { $resp.error } else { $resp | ConvertTo-Json -Depth 2 }
            Write-Warning "Register failed: $err"
            # if conflict, try login immediately
            if ($err -match "409" -or $err -match "Conflict") {
                Write-Host "User exists, attempting login for $($u.email)"
                $login = Invoke-Json -method Post -url "$baseUrl/auth/login" -body @{ email = $u.email; password = $u.password }
                if ($login -is [System.Management.Automation.PSCustomObject] -and $login.success -eq $true) {
                    $token = $login.data.accessToken
                    $userId = $login.data.user.id
                    Write-Host "Logged in existing user: $($u.email) id=$userId"
                    $created += @{ email = $u.email; id = $userId; token = $token; username = $u.username; role = $u.role }
                    $registered = $true
                    break
                } else {
                    $loginErr = if ($login.error) { $login.error } else { $login | ConvertTo-Json -Depth 2 }
                    Write-Warning "Login fallback failed: $loginErr"
                }
            }
            Start-Sleep -Seconds $delaySeconds
        }
    }
    if (-not $registered) {
        Write-Warning "Could not register or login user $($u.email) after $maxAttempts attempts"
    }
}

# create companies, jobs, profiles, applications similar to previous script
$companies = @()
$recruiters = $created | Where-Object { $_.role -eq 'recruiter' }
$companyCount = 0
foreach ($r in $recruiters) {
    $companyCount++
    $payload = @{ name = "SmokeCo $companyCount"; description = "Smoke test company"; website = "https://example.com"; industry = "Software"; location = "Test City" }
    $resp = Invoke-Json -method Post -url "$baseUrl/companies" -body $payload -token $r.token
    if ($resp -is [System.Management.Automation.PSCustomObject] -and $resp.success -eq $true) {
        Write-Host "Created company id=$($resp.data.id) by $($r.email)"
        $companies += $resp.data
    } else { $err = if ($resp.error) { $resp.error } else { $resp | ConvertTo-Json -Depth 2 }; Write-Warning "Create company failed for $($r.email): $err" }
}

$jobs = @()
$idx = 0
foreach ($comp in $companies) {
    $r = $recruiters[$idx]
    $idx++
    $jobPayload = @{ title = "Smoke Tester ($idx)"; description = "Test job"; requirements = ""; location = "Remote"; workplaceType = 'REMOTE'; employmentType = 'FULL_TIME'; experienceLevel = 'Mid'; minSalary = 50000; maxSalary = 70000; status = 'OPEN'; companyId = $comp.id }
    $resp = Invoke-Json -method Post -url "$baseUrl/jobs" -body $jobPayload -token $r.token
    if ($resp -is [System.Management.Automation.PSCustomObject] -and $resp.success -eq $true) {
        Write-Host "Created job id=$($resp.data.id)"
        $jobs += $resp.data
    } else { $err = if ($resp.error) { $resp.error } else { $resp | ConvertTo-Json -Depth 2 }; Write-Warning "Create job failed: $err" }
}

$candidates = $created | Where-Object { $_.role -eq 'candidate' }
$jobToApply = if ($jobs.Count -gt 0) { $jobs[0] } else { $null }
foreach ($c in $candidates) {
    $profilePayload = @{ id = $null; userId = $c.id; headline = "Candidate $($c.username)"; summary = "Summary"; location = "City"; website = $null; experiences = @(); educations = @(); skills = @(); connectionsCount = 0; createdAt = $null; updatedAt = $null }
    $resp = Invoke-Json -method Put -url "$baseUrl/profiles/$($c.id)" -body $profilePayload -token $c.token
    if ($resp -is [System.Management.Automation.PSCustomObject] -and $resp.success -eq $true) { Write-Host "Profile updated for $($c.email)" } else { $err = if ($resp.error) { $resp.error } else { $resp | ConvertTo-Json -Depth 2 }; Write-Warning "Profile update failed for $($c.email): $err" }
    if ($jobToApply -ne $null) {
        $applyPayload = @{ jobId = $jobToApply.id; coverLetter = "I am interested" }
        $resp = Invoke-Json -method Post -url "$baseUrl/applications" -body $applyPayload -token $c.token
        if ($resp -is [System.Management.Automation.PSCustomObject] -and $resp.success -eq $true) { Write-Host "User $($c.email) applied to job $($jobToApply.id)" } else { $err = if ($resp.error) { $resp.error } else { $resp | ConvertTo-Json -Depth 2 }; Write-Warning "Application failed for $($c.email): $err" }
    }
}

# quick reads
foreach ($u in $created) {
    $me = Invoke-Json -method Get -url "$baseUrl/auth/me" -token $u.token
    Write-Host "auth/me for $($u.email):"; $me
    $profile = Invoke-Json -method Get -url "$baseUrl/profiles/$($u.id)" -token $u.token
    Write-Host "profile for $($u.email):"; $profile
}

Write-Host "Done"