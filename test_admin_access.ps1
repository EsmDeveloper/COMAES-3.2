# Admin Access Test Script
$API_BASE = "http://192.168.0.150:3001"

Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Blue
Write-Host "TEST: Admin Access to /api/admin/stats" -ForegroundColor Blue
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Blue
Write-Host ""

# Step 1: Login
Write-Host "Step 1: Logging in as admin..." -ForegroundColor Yellow
Write-Host ""

$loginPayload = @{
    usuario = "admin@comaes.com"
    senha = "Senha123!"
} | ConvertTo-Json

$loginResponse = Invoke-WebRequest -Uri "$API_BASE/auth/login" `
    -Method POST `
    -ContentType "application/json" `
    -Body $loginPayload `
    -ErrorAction SilentlyContinue

$loginData = $loginResponse.Content | ConvertFrom-Json

Write-Host "Login Response:"
$loginData | ConvertTo-Json | Write-Host
Write-Host ""

$token = $loginData.token
if (-not $token) {
    Write-Host "❌ Login failed - no token received" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Token received:" -ForegroundColor Green
Write-Host $token.Substring(0, 50) "..."
Write-Host ""

# Step 2: Decode JWT
Write-Host "Step 2: Decoding JWT payload..." -ForegroundColor Yellow
Write-Host ""

$parts = $token.Split('.')
if ($parts.Length -eq 3) {
    $payload = $parts[1]
    # Add padding if needed
    $padding = 4 - ($payload.Length % 4)
    if ($padding -ne 4) {
        $payload += '=' * $padding
    }
    
    $decodedBytes = [Convert]::FromBase64String($payload)
    $decodedText = [System.Text.Encoding]::UTF8.GetString($decodedBytes)
    
    Write-Host "Payload:"
    $decodedText | ConvertFrom-Json | ConvertTo-Json | Write-Host
    Write-Host ""
}

# Step 3: Test /api/admin/stats
Write-Host "Step 3: Testing /api/admin/stats..." -ForegroundColor Yellow
Write-Host ""

try {
    $statsResponse = Invoke-WebRequest -Uri "$API_BASE/api/admin/stats" `
        -Method GET `
        -Headers @{
            "Authorization" = "Bearer $token"
            "Accept" = "application/json"
        } `
        -ErrorAction SilentlyContinue
    
    $httpStatus = $statsResponse.StatusCode
    $responseBody = $statsResponse.Content | ConvertFrom-Json
    
    Write-Host "HTTP Status: $httpStatus" -ForegroundColor Green
    Write-Host "Response:"
    $responseBody | ConvertTo-Json | Write-Host
    Write-Host ""
    
    if ($httpStatus -eq 200) {
        Write-Host "✅ SUCCESS - Admin can access /api/admin/stats" -ForegroundColor Green
    }
} catch {
    $statusCode = $_.Exception.Response.StatusCode.Value__
    
    try {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $errorBody = $reader.ReadToEnd() | ConvertFrom-Json
        $reader.Close()
    } catch {
        $errorBody = $_.Exception.Message
    }
    
    Write-Host "HTTP Status: $statusCode" -ForegroundColor Red
    Write-Host "Error Response:"
    if ($errorBody -is [object]) {
        $errorBody | ConvertTo-Json | Write-Host
    } else {
        Write-Host $errorBody
    }
    Write-Host ""
    
    Write-Host "❌ FAILED - HTTP $statusCode" -ForegroundColor Red
}

Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Blue
