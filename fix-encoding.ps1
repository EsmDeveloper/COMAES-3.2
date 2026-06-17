# Fix Encoding Script - UTF-8 Correction
# Este script corrige problemas de encoding em arquivos de código

param([switch]$DryRun = $true)

$ErrorActionPreference = "Continue"
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$projectRoot = $scriptPath

Write-Host "Starting encoding fix..." -ForegroundColor Green
Write-Host "Mode: $(if ($DryRun) { 'DRY RUN' } else { 'ACTIVE' })" -ForegroundColor Cyan

# Extensions to process
$extensions = @('js', 'jsx', 'ts', 'tsx', 'json')
$excludeDirs = @('node_modules', '.git', 'dist', 'build', '.next', '.vite', '.kiro')

# Get all files
$files = Get-ChildItem -Path $projectRoot -Recurse -File -ErrorAction SilentlyContinue | 
    Where-Object {
        $ext = $_.Extension -replace '\.', ''
        $extensions -contains $ext -and 
        -not ($_.FullName -match ($excludeDirs -join '|'))
    }

$totalFiles = @($files).Count
Write-Host "Found $totalFiles files to process" -ForegroundColor Green

$processedCount = 0
$modifiedCount = 0

foreach ($file in $files) {
    $processedCount++
    $relativePath = $file.FullName -replace [regex]::Escape($projectRoot), '.'
    
    try {
        # Read file
        $content = Get-Content -Path $file.FullName -Raw -Encoding UTF8 -ErrorAction SilentlyContinue
        if ($null -eq $content) {
            $content = Get-Content -Path $file.FullName -Raw -Encoding Default -ErrorAction SilentlyContinue
        }
        
        $originalContent = $content
        $hasChanges = $false
        
        # Fix common mojibake patterns (UTF-8 misinterpreted as LATIN-1)
        $replacements = @(
            'Ã§', 'ç'
            'Ã¡', 'á'
            'Ã©', 'é'
            'Ã­', 'í'
            'Ã³', 'ó'
            'Ã¹', 'ú'
            'Ã£', 'ã'
            'Ã±', 'ñ'
            'Ã¢', 'â'
            'Ãª', 'ê'
            'Ã´', 'ô'
            'Ã¼', 'ü'
        )
        
        for ($i = 0; $i -lt $replacements.Count; $i += 2) {
            if ($content -like "*$($replacements[$i])*") {
                $content = $content -replace [regex]::Escape($replacements[$i]), $replacements[$i + 1]
                $hasChanges = $true
            }
        }
        
        if ($hasChanges) {
            $modifiedCount++
            if (-not $DryRun) {
                $utf8NoBom = New-Object System.Text.UTF8Encoding($false)
                [System.IO.File]::WriteAllText($file.FullName, $content, $utf8NoBom)
                Write-Host "FIXED: $relativePath" -ForegroundColor Green
            } else {
                Write-Host "WOULD FIX: $relativePath" -ForegroundColor Yellow
            }
        }
    }
    catch {
        Write-Host "ERROR in $relativePath : $_" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "Total files processed: $processedCount" -ForegroundColor Green
Write-Host "Files modified: $modifiedCount" -ForegroundColor Green
Write-Host ""

if ($DryRun) {
    Write-Host "Dry run complete. To apply changes, run:" -ForegroundColor Yellow
    Write-Host ".\fix-encoding.ps1 -DryRun:`$false" -ForegroundColor Cyan
}
