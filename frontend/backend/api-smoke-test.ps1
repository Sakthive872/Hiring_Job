# API smoke test script for the backend
# Usage: Open PowerShell in project folder and run: .\api-smoke-test.ps1
# Adjust $baseUrl if backend is on a different host/port

$baseUrl = $env:API_URL
if (-not $baseUrl -or $baseUrl -eq '') { $baseUrl = 'http://localhost:8080/api/v1' }
$maxAttempts = 3
$delaySeconds = 2

function Invoke-Json($method, $url, $body = $null, $token = $null) {
    try {
        $headers = @{'Content-Type' = 'application/json'}
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

# Users to create: 3 candidates, 2 recruiters
$users = @(
    @{ username = 'alice'; email = 'alice+test@example.com'; password = 'Password1!'; role = 'candidate' },
    @{ username = 'bob'; email = 'bob+test@example.com'; password = 'Password1!'; role = 'candidate' },
    @{ username = 'carol'; email = 'carol+test@example.com'; password = 'Password1!'; role = 'candidate' },
    @{ username = 'hr1'; email = 'hr1+test@example.com'; password = 'Password1!'; role = 'recruiter' },
    @{ username = 'hr2'; email = 'hr2+test@example.com'; password = 'Password1!'; role = 'recruiter' }
)

$created = @()

foreach ($u in $users) {
    $attempt = 0
    while ($attempt -lt $maxAttempts) {
        $attempt++
        Write-Host "Registering $($u.email) (attempt $attempt)"
        $resp = Invoke-Json -method Post -url "$baseUrl/auth/register" -body @{ username = $u.username; email = $u.email; password = $u.password; role = $u.role }
        if ($resp -is [System.Management.Automation.PSCustomObject] -and $resp.success -eq $true) {
            $token = $resp.data.accessToken
            $userId = $resp.data.user.id
            Write-Host "Registered: $($u.email) id=$userId"
            $created += @{ email = $u.email; id = $userId; token = $token; username = $u.username; role = $u.role }
            break
        } else {
            $err = if ($resp.error) { $resp.error } else { $resp | ConvertTo-Json -Depth 2 }
            Write-Warning "Register failed: $err";
            Start-Sleep -Seconds $delaySeconds
        }
    }
}

# Login any that didn't return token on register (idempotent)
foreach ($u in $created) {
    if (-not $u.token) {
        Write-Host "Logging in $($u.email)"
        $login = Invoke-Json -method Post -url "$baseUrl/auth/login" -body @{ email = $u.email; password = 'Password1!' }
        if ($login -is [System.Management.Automation.PSCustomObject] -and $login.success -eq $true) {
            $u.token = $login.data.accessToken
            $u.id = $login.data.user.id
        } else { Write-Warning "Login failed for $($u.email)" }
    }
}

# Create one company per recruiter
$companies = @()
$recruiters = $created | Where-Object { $_.role -eq 'recruiter' }
$companyCount = 0
foreach ($r in $recruiters) {
    $companyCount++
    $payload = @{ name = "Test Company $companyCount"; description = "Company for smoke tests"; website = "https://example.com"; industry = "Software"; location = "Test City" }
    $resp = Invoke-Json -method Post -url "$baseUrl/companies" -body $payload -token $r.token
    if ($resp -is [System.Management.Automation.PSCustomObject] -and $resp.success -eq $true) {
        Write-Host "Created company id=$($resp.data.id) by $($r.email)"
        $companies += $resp.data
    } else { $err = if ($resp.error) { $resp.error } else { $resp | ConvertTo-Json -Depth 2 }; Write-Warning "Create company failed for $($r.email): $err" }
}

# Create one job per company by the corresponding recruiter
$jobs = @()
$idx = 0
foreach ($comp in $companies) {
    $r = $recruiters[$idx]
    $idx++
    $jobPayload = @{ title = "Software Engineer ($idx)"; description = "Test job"; requirements = "none"; location = "Remote"; workplaceType = 'REMOTE'; employmentType = 'FULL_TIME'; experienceLevel = 'Mid'; minSalary = 50000; maxSalary = 80000; status = 'OPEN'; companyId = $comp.id }
    $resp = Invoke-Json -method Post -url "$baseUrl/jobs" -body $jobPayload -token $r.token
    if ($resp -is [System.Management.Automation.PSCustomObject] -and $resp.success -eq $true) {
        Write-Host "Created job id=$($resp.data.id)"
        $jobs += $resp.data
    } else { $err = if ($resp.error) { $resp.error } else { $resp | ConvertTo-Json -Depth 2 }; Write-Warning "Create job failed: $err" }
}

# For each candidate, create a profile and apply to the first job
$candidates = $created | Where-Object { $_.role -eq 'candidate' }
$jobToApply = if ($jobs.Count -gt 0) { $jobs[0] } else { $null }

foreach ($c in $candidates) {
    # Build a minimal profile payload matching ProfileResponse record shape
    $profilePayload = @{ id = $null; userId = $c.id; headline = "Candidate $($c.username)"; summary = "Summary for $($c.username)"; location = "City"; website = $null; experiences = @(); educations = @(); skills = @(); connectionsCount = 0; createdAt = $null; updatedAt = $null }
    $resp = Invoke-Json -method Put -url "$baseUrl/profiles/$($c.id)" -body $profilePayload -token $c.token
    if ($resp -is [System.Management.Automation.PSCustomObject] -and $resp.success -eq $true) { Write-Host "Profile updated for $($c.email)" } else { $err = if ($resp.error) { $resp.error } else { $resp | ConvertTo-Json -Depth 2 }; Write-Warning "Profile update failed for $($c.email): $err" }

    if ($jobToApply -ne $null) {
        $applyPayload = @{ jobId = $jobToApply.id; coverLetter = "I am interested" }
        $resp = Invoke-Json -method Post -url "$baseUrl/applications" -body $applyPayload -token $c.token
        if ($resp -is [System.Management.Automation.PSCustomObject] -and $resp.success -eq $true) {
            Write-Host "User $($c.email) applied to job $($jobToApply.id)"
        } else {
            $err = if ($resp.error) { $resp.error } else { $resp | ConvertTo-Json -Depth 2 }
            Write-Warning "Application failed for $($c.email): $err"
        }
    }
}

# Validate read endpoints: profiles, jobs, applications, notifications
Write-Host "Validating read endpoints..."
$errors = @()
foreach ($u in $created) {
    $me = Invoke-Json -method Get -url "$baseUrl/auth/me" -token $u.token
    if (-not ($me -is [System.Management.Automation.PSCustomObject] -and $me.success -eq $true)) { $errors += "auth/me failed for $($u.email)" }

    $profile = Invoke-Json -method Get -url "$baseUrl/profiles/$($u.id)" -token $u.token
    if (-not ($profile -is [System.Management.Automation.PSCustomObject] -and $profile.success -eq $true)) { $errors += "profiles/$($u.id) failed" }

    $notes = Invoke-Json -method Get -url "$baseUrl/notifications" -token $u.token
    if (-not ($notes -is [System.Management.Automation.PSCustomObject] -and $notes.success -eq $true)) { $errors += "notifications for $($u.email) failed" }
}

$jobsList = Invoke-Json -method Get -url "$baseUrl/jobs"
if (-not ($jobsList -is [System.Management.Automation.PSCustomObject] -and $jobsList.success -eq $true)) { $errors += "jobs list failed" }

if ($errors.Count -eq 0) {
    Write-Host "Smoke test completed successfully. Inserted sample data and validated endpoints."
    exit 0
} else {
    Write-Warning "Smoke test finished with errors:`n$($errors -join "`n")"
    exit 2
}
