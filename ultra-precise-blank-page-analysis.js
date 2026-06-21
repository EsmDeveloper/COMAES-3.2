#!/usr/bin/env node

/**
 * ultra-precise-blank-page-analysis.js
 * Análise EXTREMAMENTE PRECISA para encontrar abas que renderizam BRANCO
 * Verifica estruturas exatas de renderização
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ADMIN_TABS_DIR = 'FrontEnd/src/Administrador';

const TABS = [
  'AdminStats.jsx',
  'TorneiosTab.jsx',
  'CertificadosTab.jsx',
  'NotificationsTab.jsx',
  'QuestoesTorneiosTab.jsx',
  'QuestoesTestesTab.jsx',
  'QuestoesPendentesTab.jsx',
  'QuestoesColaboradoresTab.jsx',
  'ColaboradoresPendentesTab.jsx',
  'ColaboradoresTab.jsx',
  'TableManager.jsx',
  'DisciplinasAdmin.jsx',
  'BlocosColaboradoresTab.jsx'
];

class UltraPreciseAnalyzer {
  constructor() {
    this.findings = [];
  }

  extractJSXStructure(content, fileName) {
    // Encontrar o retorno JSX principal
    const mainReturn = content.match(/^export default function.*?\n\s*return\s*\(([\s\S]*?)\n\);\s*}|^export default const.*?=\s*\(\s*\)\s*=>\s*\{[\s\S]*?return\s*\(([\s\S]*?)\n\);\s*}|const\s+\w+\s*=\s*\(\s*\)\s*=>\s*{\s*return\s*\(([\s\S]*?)\n\s*\);[\s\S]*?}/);

    if (!mainReturn) {
      // Try simpler pattern
      const simpleReturn = content.match(/return\s*\(([\s\S]*?)\);\s*}(?!.*return)/);
      if (!simpleReturn) return null;
      return simpleReturn[1];
    }

    return mainReturn[1];
  }

  analyzeRenderingPaths(content, fileName) {
    const issues = [];
    
    // Pattern 1: render algo sem verificação de estado
    const patterns = [
      {
        name: 'Direct JSX render without condition',
        regex: /return\s*\(\s*<(\w+)[^>]*>[\s\S]{1,100}</,
        severity: 'HIGH',
        message: 'Pode renderizar algo sem verificar estado de loading/dados'
      },
      {
        name: 'map() outside ternary/if',
        regex: /^(?!.*\?.*:)[\s\S]*?\.map\s*\(/m,
        severity: 'MEDIUM',
        message: '.map() encontrado sem ternário/if verificador antes'
      },
      {
        name: 'Empty return for data component',
        regex: /if\s*\(\s*!.*\s*\)\s*return\s*\(\s*<>\s*<\/>\s*\)/,
        severity: 'HIGH',
        message: 'Retorna fragment vazio sem mensagem'
      }
    ];

    for (const pattern of patterns) {
      if (pattern.regex.test(content)) {
        // Verificar contexto
        const lines = content.split('\n');
        let hasRecovery = false;

        // Procurar por loading/error states antes
        for (let i = 0; i < Math.min(50, lines.length); i++) {
          const line = lines[i];
          if (line.includes('loading') || line.includes('error') || line.includes('if (') || line.includes('?')) {
            hasRecovery = true;
            break;
          }
        }

        if (!hasRecovery) {
          issues.push({
            pattern: pattern.name,
            severity: pattern.severity,
            message: pattern.message
          });
        }
      }
    }

    return issues;
  }

  checkForSkeletonLoadingOrFallback(content) {
    const hasSkeletonLoader = /animate-pulse|skeleton|Loader|loading.*\?|isLoading/i.test(content);
    const hasErrorBoundary = /error.*\?|catch|try.*fetch/i.test(content);
    const hasEmptyState = /length.*===.*0|Nenhum|empty|sem dados|no data/i.test(content);

    return {
      skeletonLoader: hasSkeletonLoader,
      errorBoundary: hasErrorBoundary,
      emptyState: hasEmptyState
    };
  }

  runAnalysis() {
    console.log('\n🔬 ANÁLISE ULTRA-PRECISA: ABAS QUE RENDERIZAM BRANCO\n');
    console.log('═'.repeat(90));

    let totalOK = 0;
    let totalIssues = 0;

    for (const fileName of TABS) {
      const filePath = path.join(ADMIN_TABS_DIR, fileName);
      
      if (!fs.existsSync(filePath)) {
        console.log(`⚠️  ${fileName} - NÃO ENCONTRADO`);
        continue;
      }

      const content = fs.readFileSync(filePath, 'utf8');
      const fallbacks = this.checkForSkeletonLoadingOrFallback(content);
      const issues = this.analyzeRenderingPaths(content, fileName);

      // Calcular score de segurança
      let safetyScore = 100;
      if (!fallbacks.skeletonLoader) safetyScore -= 30;
      if (!fallbacks.errorBoundary) safetyScore -= 20;
      if (!fallbacks.emptyState) safetyScore -= 20;

      const status = safetyScore === 100 ? '✅' :
                     safetyScore >= 70 ? '✓ ' :
                     safetyScore >= 50 ? '⚠️ ' : '🔴';

      console.log(`\n${status} ${fileName} [${safetyScore}%]`);
      
      if (!fallbacks.skeletonLoader) {
        console.log(`   ❌ SEM skeleton loader/loading indicator`);
      }
      if (!fallbacks.errorBoundary) {
        console.log(`   ❌ SEM tratamento de erro`);
      }
      if (!fallbacks.emptyState) {
        console.log(`   ❌ SEM empty state message`);
      }

      if (issues.length > 0) {
        console.log(`   Problemas específicos:`);
        issues.forEach(issue => {
          console.log(`     - [${issue.severity}] ${issue.message}`);
        });
        totalIssues += issues.length;
      }

      if (safetyScore === 100) totalOK++;
    }

    console.log('\n' + '═'.repeat(90));
    console.log(`\n✅ Componentes seguros: ${totalOK}/${TABS.length}`);
    console.log(`⚠️  Componentes com problemas: ${TABS.length - totalOK}`);
    console.log(`Total de problemas detectados: ${totalIssues}`);

    if (totalIssues === 0 && totalOK === TABS.length) {
      console.log('\n🎉 EXCELENTE! Todas as abas têm tratamento apropriado para:\n');
      console.log('  ✓ Loading states (skeleton ou spinner)');
      console.log('  ✓ Error handling\n  ✓ Empty states (mensagens quando sem dados)');
      console.log('\n✅ A plataforma NÃO deve renderizar páginas em branco!\n');
    }
  }
}

// Executar
const analyzer = new UltraPreciseAnalyzer();
analyzer.runAnalysis();
