#!/bin/bash
# Script para remover emojis de todos os console.log nos arquivos Frontend e Backend
# Este script preserva a funcionalidade mas melhora a aparência profissional

# Função para remover emojis de um arquivo
remove_emojis_from_file() {
    local file="$1"
    
    # Remover emojis específicos dos console.log
    sed -i \
        -e "s/console\.log('\ud83d\udd14/console.log('[NOTIFY]/g" \
        -e "s/console\.log(\"\ud83d\udd14/console.log(\"[NOTIFY]/g" \
        -e "s/console\.log(\"\ud83d\udd04/console.log(\"[REFRESH]/g" \
        -e "s/console\.log(\"\ud83d\udccb/console.log(\"[DATA]/g" \
        -e "s/console\.log(\"\ud83d\udccb/console.log(\"[DEBUG]/g" \
        -e "s/console\.log('\u2705/console.log('[OK]/g" \
        -e "s/console\.log(\"\u2705/console.log(\"[OK]/g" \
        -e "s/console\.error(\"\u274c/console.error(\"[ERROR]/g" \
        -e "s/console\.log('\ud83d\udd0c/console.log('[SETUP]/g" \
        -e "s/console\.log(\"\ud83d\udd0c/console.log(\"[SETUP]/g" \
        -e "s/console\.warn('\u26a0\ufe0f/console.warn('[WARNING]/g" \
        -e "s/console\.warn(\"\u26a0\ufe0f/console.warn(\"[WARNING]/g" \
        "$file"
    
    echo "Processed: $file"
}

# Arrays de padrões a serem substituídos
declare -a FRONTEND_FILES=(
    "FrontEnd/src/hooks/useNotificacoesRealtime.js"
    "FrontEnd/src/Colaborador/ColaboradorDashboard.jsx"
    "FrontEnd/src/components/components_teste/tutormessage.jsx"
    "FrontEnd/src/__tests__/integration/task-16-4-admin-rejection.test.jsx"
    "FrontEnd/src/__tests__/integration/16.2-create-question-flow.test.jsx"
)

declare -a BACKEND_FILES=(
    "BackEnd/apply_migration_types.js"
    "BackEnd/apply_migrations_v2.js"
    "BackEnd/apply_migrations.js"
    "BackEnd/check-blocos.js"
    "BackEnd/check-admin-password.js"
    "BackEnd/certificates/generator/generateCertificado.js"
    "BackEnd/check-db.js"
    "BackEnd/create-test-user.js"
)

echo "=== Iniciando limpeza de emojis ==="
echo ""

# Processar arquivos Frontend
echo "Frontend:"
for file in "${FRONTEND_FILES[@]}"; do
    if [ -f "$file" ]; then
        remove_emojis_from_file "$file"
    fi
done

echo ""
echo "Backend:"
# Processar arquivos Backend
for file in "${BACKEND_FILES[@]}"; do
    if [ -f "$file" ]; then
        remove_emojis_from_file "$file"
    fi
done

echo ""
echo "=== Limpeza concluída ==="
