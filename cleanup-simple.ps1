# Script PowerShell para remover emojis e corrigir encoding
# Versao simplificada com suporte melhorado a encoding

Write-Host "Iniciando limpeza de emojis..." -ForegroundColor Cyan

# Funcao para processar arquivos
function Clean-File {
    param([string]$Path)
    
    if (-not (Test-Path $Path)) {
        return $false
    }
    
    try {
        # Ler arquivo como UTF-8
        $content = Get-Content -Path $Path -Encoding UTF8 -Raw
        
        # Remover emojis comuns de console.log
        # Usar abordagem mais segura com caracteres Unicode
        $patterns = @(
            @{Old = '[NOTIFY]'; New = '[NOTIFY]'},  # Placeholder para segurança
            @{Old = '`u{1F514}'; New = '[NOTIFY]'},  # Emoji sino
            @{Old = '`u{1F504}'; New = '[REFRESH]'}, # Emoji seta
            @{Old = '`u{1F4CB}'; New = '[DATA]'},    # Emoji clipboard
        )
        
        # Usar regex simples para limpar
        $content = $content -replace '\[NOTIFY\]', '[NOTIFY]'
        $content = $content -replace '\[REFRESH\]', '[REFRESH]'
        $content = $content -replace '\[ERROR\]', '[ERROR]'
        $content = $content -replace '\[OK\]', '[OK]'
        $content = $content -replace '\[SUCCESS\]', '[SUCCESS]'
        
        # Salvar com encoding UTF-8 sem BOM
        $utf8NoBom = New-Object System.Text.UTF8Encoding($false)
        [System.IO.File]::WriteAllText($Path, $content, $utf8NoBom)
        
        return $true
    }
    catch {
        Write-Host "Erro em $Path : $_" -ForegroundColor Red
        return $false
    }
}

# Lista de arquivos a processar
$files = @(
    "FrontEnd/src/hooks/useNotificacoesRealtime.js"
    "FrontEnd/src/Colaborador/ColaboradorDashboard.jsx"
    "FrontEnd/src/components/components_teste/tutormessage.jsx"
    "BackEnd/apply_migration_types.js"
    "BackEnd/apply_migrations_v2.js"
    "BackEnd/apply_migrations.js"
    "BackEnd/check-blocos.js"
    "BackEnd/certificates/generator/generateCertificado.js"
)

$success = 0
foreach ($file in $files) {
    if (Clean-File $file) {
        Write-Host "OK: $file" -ForegroundColor Green
        $success++
    }
}

Write-Host ""
Write-Host "Processados: $success/$($files.Count) arquivos" -ForegroundColor Green
