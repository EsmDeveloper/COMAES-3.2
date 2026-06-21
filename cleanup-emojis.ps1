# Script PowerShell para remover emojis e corrigir encoding
# Preserve funcionalidade mas melhora aparência profissional

param(
    [string]$Mode = "all"  # all, frontend, backend, test
)

function Remove-EmojisFromFile {
    param(
        [string]$FilePath
    )
    
    if (-not (Test-Path $FilePath)) {
        Write-Host "SKIP: Arquivo não encontrado - $FilePath" -ForegroundColor Yellow
        return
    }
    
    try {
        $content = Get-Content -Path $FilePath -Encoding UTF8 -Raw
        $originalLength = $content.Length
        
        # Mapeamento de emojis para substituições profissionais
        $replacements = @{
            '🔔' = '[NOTIFY]'
            '🔄' = '[REFRESH]'
            '📋' = '[DATA]'
            '✅' = '[OK]'
            '❌' = '[ERROR]'
            '🚀' = '[ROCKET]'
            '📝' = '[WRITE]'
            '📊' = '[CHART]'
            '🔍' = '[SEARCH]'
            '🔗' = '[LINK]'
            '🔌' = '[PLUG]'
            '⚠️' = '[WARNING]'
            '🤔' = '[THINK]'
            '🎉' = '[PARTY]'
            '⏰' = '[TIME]'
            '😊' = '[HAPPY]'
            '😅' = '[OOPS]'
            '🎓' = '[CERT]'
            '💻' = '[CODE]'
            '⚡' = '[ZAPPER]'
        }
        
        foreach ($emoji in $replacements.Keys) {
            if ($content -match [regex]::Escape($emoji)) {
                $content = $content -replace [regex]::Escape($emoji), $replacements[$emoji]
            }
        }
        
        # Converter para UTF-8 sem BOM e salvar
        $utf8NoBom = New-Object System.Text.UTF8Encoding($false)
        [System.IO.File]::WriteAllText($FilePath, $content, $utf8NoBom)
        
        $newLength = $content.Length
        Write-Host "✓ Processado: $FilePath (emojis: $(($originalLength - $newLength) / 3) removidos)" -ForegroundColor Green
    }
    catch {
        Write-Host "✗ Erro processando $FilePath`: $_" -ForegroundColor Red
    }
}

function Convert-FileEncoding {
    param(
        [string]$FilePath
    )
    
    if (-not (Test-Path $FilePath)) {
        return
    }
    
    try {
        $content = Get-Content -Path $FilePath -Encoding UTF8 -Raw
        $utf8NoBom = New-Object System.Text.UTF8Encoding($false)
        [System.IO.File]::WriteAllText($FilePath, $content, $utf8NoBom)
    }
    catch {
        # Ignorar silenciosamente se houver erro
    }
}

Write-Host "╔════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  Limpeza de Emojis e Correção de Encoding COMAES  ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Arquivos Frontend
$frontendFiles = @(
    "FrontEnd/src/hooks/useNotificacoesRealtime.js"
    "FrontEnd/src/Colaborador/ColaboradorDashboard.jsx"
    "FrontEnd/src/components/components_teste/tutormessage.jsx"
    "FrontEnd/src/__tests__/integration/task-16-4-admin-rejection.test.jsx"
    "FrontEnd/src/__tests__/integration/16.2-create-question-flow.test.jsx"
    "FrontEnd/src/certificados/CertProgramacao.jsx"
    "FrontEnd/src/certificados/CertMatematica.jsx"
    "FrontEnd/src/certificados/CertIngles.jsx"
    "FrontEnd/src/components/NivelBadge.jsx"
    "FrontEnd/src/components/ModalVencedores.jsx"
)

# Arquivos Backend
$backendFiles = @(
    "BackEnd/apply_migration_types.js"
    "BackEnd/apply_migrations_v2.js"
    "BackEnd/apply_migrations.js"
    "BackEnd/check-blocos.js"
    "BackEnd/check-admin-password.js"
    "BackEnd/certificates/generator/generateCertificado.js"
    "BackEnd/check-db.js"
    "BackEnd/create-test-user.js"
    "BackEnd/add_slug.js"
)

if ($Mode -eq "frontend" -or $Mode -eq "all") {
    Write-Host "🔧 Processando Frontend..." -ForegroundColor Cyan
    foreach ($file in $frontendFiles) {
        Remove-EmojisFromFile $file
    }
    Write-Host ""
}

if ($Mode -eq "backend" -or $Mode -eq "all") {
    Write-Host "🔧 Processando Backend..." -ForegroundColor Cyan
    foreach ($file in $backendFiles) {
        Remove-EmojisFromFile $file
    }
    Write-Host ""
}

Write-Host "✓ Limpeza concluída com sucesso!" -ForegroundColor Green
Write-Host ""
Write-Host "Próximos passos:" -ForegroundColor Yellow
Write-Host "1. Revisar os arquivos modificados"
Write-Host "2. Testar a funcionalidade da plataforma"
Write-Host "3. Fazer commit das alterações"
