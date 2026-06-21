# Cleanup Backend Emojis - Script sem caracteres especiais
# Substitui emojis por tags profissionais

param(
    [string]$Path = ".\BackEnd"
)

Write-Host "`n=== Limpeza de Emojis Backend ===" -ForegroundColor Cyan

# Lista de arquivos com emojis
$files = @(
    ".\BackEnd\add_slug.js",
    ".\BackEnd\apply_migrations_v2.js",
    ".\BackEnd\apply_migrations.js",
    ".\BackEnd\apply_migration_types.js",
    ".\BackEnd\check-admin-password.js",
    ".\BackEnd\check_schema.js",
    ".\BackEnd\check-recent.js",
    ".\BackEnd\check-db.js"
)

$processed = 0

foreach ($file in $files) {
    if (Test-Path $file) {
        try {
            $content = [System.IO.File]::ReadAllText($file, [System.Text.Encoding]::UTF8)
            $before = $content
            
            # Substituir manualmente cada emoji
            $content = $content.Replace([char]0x1F680, "[ROCKET]")  # 🚀
            $content = $content.Replace([char]0x2705, "[SUCCESS]")  # ✅
            $content = $content.Replace([char]0x274C, "[ERROR]")    # ❌
            $content = $content.Replace([char]0x26A0, "[WARNING]")  # ⚠️
            
            if ($content -ne $before) {
                [System.IO.File]::WriteAllText($file, $content, [System.Text.Encoding]::UTF8)
                Write-Host "[DONE] $file" -ForegroundColor Green
                $processed++
            }
        }
        catch {
            Write-Host "[SKIP] $file" -ForegroundColor Yellow
        }
    }
}

Write-Host "`nArquivos: $processed processados" -ForegroundColor Green

